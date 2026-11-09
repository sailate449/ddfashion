const crypto = require('crypto');
const fetch = require('node-fetch');
const {
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  MAX_OTP_ATTEMPTS,
  HOURLY_WINDOW_MS,
  MAX_EMAIL_OTP_PER_HOUR,
  MAX_IP_OTP_PER_HOUR,
  JSON_HEADERS,
  admin,
  initFirebaseAdmin,
  getEmailJsConfig,
  normalizeEmail,
  isValidEmail,
  sha256Hex,
  hashOtpWithSalt,
  generateSixDigitOtp,
  getClientIp
} = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  try {
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Invalid JSON request body.' })
      };
    }

    const email = normalizeEmail(body.email);
    const purpose = ['reset', 'login'].includes(body.purpose) ? body.purpose : 'register';
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'မှန်ကန်သော Email လိပ်စာ ထည့်သွင်းပေးပါရန်။ (Please enter a valid email address.)'
        })
      };
    }

    if (purpose === 'register' && password !== confirmPassword) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Password နှင့် Confirm Password မတူညီပါ။' }) };
    }

    if (purpose === 'register' && password.length < 6) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'Password သည် အနည်းဆုံး (၆) လုံး ရှိရပါမည်။ (Password must be at least 6 characters.)'
        })
      };
    }

    initFirebaseAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    // 1. Check whether the Firebase account already exists
    let existingUserRecord = null;
    try {
      existingUserRecord = await auth.getUserByEmail(email);
    } catch (err) {
      if (err.code !== 'auth/user-not-found') {
        throw err;
      }
    }

    if (purpose === 'register' && existingUserRecord) {
      return {
        statusCode: 409,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          code: 'EMAIL_EXISTS',
          error: 'ဤ Email ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။ Login ဝင်ပါ။ (Account already exists for this email.)'
        })
      };
    }

    if (purpose === 'reset' && !existingUserRecord) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          code: 'USER_NOT_FOUND',
          error: 'ဤ Email ဖြင့် ဖွင့်ထားသော အကောင့် မတွေ့ရှိပါ။ Register အရင်လုပ်ပါ။'
        })
      };
    }

    if (purpose === 'login' && !existingUserRecord) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          code: 'USER_NOT_FOUND',
          error: 'ဤ Email ဖြင့် အကောင့်မတွေ့ပါ။ Register အရင်လုပ်ပါ။'
        })
      };
    }

    const now = Date.now();
    const clientIp = getClientIp(event);
    const ipKey = `ip_${sha256Hex(clientIp)}`;
    const emailKey = `${purpose}_${sha256Hex(email)}`;

    // EmailJS remains the delivery provider. Validate its configuration before
    // reserving a challenge so missing credentials do not consume the quota.
    const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();

    // Generate the challenge before the transaction; the transaction atomically
    // reserves both the per-IP and per-email quotas and replaces the old OTP.
    const otpCode = generateSixDigitOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtpWithSalt(otpCode, salt);
    const expiresAt = now + OTP_EXPIRY_MS;
    const ipRef = db.collection('otp_rate_limits').doc(ipKey);
    const challengeRef = db.collection('otp_challenges').doc(emailKey);

    const reservation = await db.runTransaction(async (tx) => {
      const [ipSnap, challengeSnap] = await Promise.all([tx.get(ipRef), tx.get(challengeRef)]);
      const ipData = ipSnap.exists ? (ipSnap.data() || {}) : {};
      const challengeData = challengeSnap.exists ? (challengeSnap.data() || {}) : {};
      const ipWindowStart = Number(ipData.windowStart || 0);
      const ipCount = Number(ipData.count || 0);
      if (ipSnap.exists && now - ipWindowStart < HOURLY_WINDOW_MS && ipCount >= MAX_IP_OTP_PER_HOUR) {
        return { blocked: 'ip' };
      }

      const lastSentAt = Number(challengeData.lastSentAt || 0);
      if (challengeSnap.exists && now - lastSentAt < RESEND_COOLDOWN_MS) {
        return { blocked: 'cooldown', retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000) };
      }

      const emailWindowStart = Number(challengeData.windowStart || 0);
      const emailSendCount = challengeSnap.exists && now - emailWindowStart < HOURLY_WINDOW_MS
        ? Number(challengeData.sendCount || 0) : 0;
      if (emailSendCount >= MAX_EMAIL_OTP_PER_HOUR) return { blocked: 'email' };

      tx.set(challengeRef, {
        email, purpose, otpHash, salt,
        attempts: 0, maxAttempts: MAX_OTP_ATTEMPTS,
        createdAt: now, lastSentAt: now, expiresAt,
        windowStart: emailSendCount ? emailWindowStart : now,
        sendCount: emailSendCount + 1,
        clientIpHash: sha256Hex(clientIp),
        verified: false, consumedAt: null, status: 'active'
      });
      tx.set(ipRef, {
        windowStart: (!ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS) ? now : ipWindowStart,
        count: (!ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS) ? 1 : ipCount + 1,
        updatedAt: now
      }, { merge: true });
      return { ok: true };
    });

    if (reservation.blocked === 'ip') {
      return { statusCode: 429, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'RATE_LIMITED_IP', error: 'OTP တောင်းဆိုမှု အကြိမ်ရေ များနေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။' }) };
    }
    if (reservation.blocked === 'cooldown') {
      return { statusCode: 429, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'COOLDOWN_ACTIVE', retryAfterSeconds: reservation.retryAfterSeconds, error: `OTP ကုဒ်အသစ် ထပ်မံတောင်းဆိုရန် ${reservation.retryAfterSeconds} စက္ကန့် စောင့်ဆိုင်းပေးပါ။` }) };
    }
    if (reservation.blocked === 'email') {
      return { statusCode: 429, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'RATE_LIMITED_EMAIL', error: '၁ နာရီအတွင်း OTP တောင်းဆိုနိုင်သည့် အကြိမ်ရေ ပြည့်သွားပါပြီ။ နောက်မှ ပြန်လည်ကြိုးစားပါ။' }) };
    }

    // 7. Send 6-digit OTP via Official EmailJS REST API (https://api.emailjs.com/api/v1.0/email/send)
    const emailJsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: email,
        user_email: email,
        email: email,
        to_name: email.split('@')[0],
        otp_code: otpCode,
        passcode: otpCode,
        code: otpCode,
        shop_name: 'DD Fashion Boutique',
        purpose: purpose === 'register' ? 'Account Registration' : (purpose === 'login' ? 'Login Verification' : 'Password Reset'),
        expiry_minutes: '15',
        message: `သင်၏ DD Fashion Verification Code (OTP) မှာ ${otpCode} ဖြစ်ပါသည်။ (၁၅ မိနစ်အတွင်း အသုံးပြုပါ)`
      }
    };

    // Include EmailJS Private Key (accessToken) if configured for Strict Server-Side API mode
    if (privateKey) {
      emailJsPayload.accessToken = privateKey;
    }

    const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': process.env.URL || 'https://ddfashion.netlify.app'
      },
      body: JSON.stringify(emailJsPayload)
    });

    if (!emailJsRes.ok) {
      const errText = await emailJsRes.text();
      // Rollback cooldown on delivery failure so the user is not locked out
      await challengeRef.delete().catch(() => {});
      console.error('EmailJS delivery failed with status:', emailJsRes.status, errText);
      return {
        statusCode: 502,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          code: 'EMAIL_DELIVERY_FAILED',
          error: 'Email ပေးပို့ရာတွင် အခက်အခဲရှိနေပါသည်။ EmailJS Settings (API Calls for non-browser applications / Private Key) ကို စစ်ဆေးပါ။'
        })
      };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: true,
        email,
        purpose,
        expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
        cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
        message: `✓ ${email} သို့ ဂဏန်း (၆) လုံး OTP ကုဒ် ပေးပို့ပြီးပါပြီ! (၁၅ မိနစ်အတွင်း ရိုက်ထည့်ပါ)`
      })
    };
  } catch (err) {
    console.error('send-otp error:', err.message);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err.message || 'OTP ပေးပို့ရာတွင် Server အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။'
      })
    };
  }
};
