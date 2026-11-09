import { jsonResponse } from '../../cloudflare/firebase-rest.js';
import {
  OTP_EXPIRY_MS, RESEND_COOLDOWN_MS, MAX_OTP_ATTEMPTS, HOURLY_WINDOW_MS,
  MAX_EMAIL_OTP_PER_HOUR, MAX_IP_OTP_PER_HOUR, isValidEmail, getClientIp,
  generateSixDigitOtp, randomSalt, hashOtpWithSalt, getEmailJsConfig,
  otpChallengeId, sha256Hex, normalizeEmail, runFirestoreTransaction,
  firestoreUpdateWrite, lookupFirebaseUserByEmail
} from './_otp.js';

function error(status, payload) { return jsonResponse(status, { ok: false, ...payload }); }

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }});
  if (request.method !== 'POST') return error(405, { error: 'Method Not Allowed' });

  try {
    let body;
    try { body = await request.json(); } catch (_) { return error(400, { error: 'Invalid JSON request body.' }); }
    const email = normalizeEmail(body.email);
    const purpose = ['reset', 'login'].includes(body.purpose) ? body.purpose : 'register';
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');
    if (!isValidEmail(email)) return error(400, { error: 'မှန်ကန်သော Email လိပ်စာ ထည့်သွင်းပေးပါရန်။ (Please enter a valid email address.)' });
    if (purpose === 'register' && password !== confirmPassword) return error(400, { error: 'Password နှင့် Confirm Password မတူညီပါ။' });
    if (purpose === 'register' && password.length < 6) return error(400, { error: 'Password သည် အနည်းဆုံး (၆) လုံး ရှိရပါမည်။ (Password must be at least 6 characters.)' });

    const existingUser = await lookupFirebaseUserByEmail(env, email);
    if (purpose === 'register' && existingUser) return error(409, { code: 'EMAIL_EXISTS', error: 'ဤ Email ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။ Login ဝင်ပါ။ (Account already exists for this email.)' });
    if (purpose !== 'register' && !existingUser) return error(404, { code: 'USER_NOT_FOUND', error: 'ဤ Email ဖြင့် အကောင့်မတွေ့ပါ။ Register အရင်လုပ်ပါ။' });

    const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig(env);
    const now = Date.now();
    const clientIp = getClientIp(request);
    const clientIpHash = await sha256Hex(clientIp);
    const ipKey = `ip_${await sha256Hex(clientIp)}`;
    const emailKey = otpChallengeId(purpose, await sha256Hex(email));
    const otpCode = generateSixDigitOtp();
    const salt = randomSalt();
    const otpHash = await hashOtpWithSalt(otpCode, salt, env);
    const expiresAt = now + OTP_EXPIRY_MS;

    const reservation = await runFirestoreTransaction(env, [
      { collection: 'otp_rate_limits', id: ipKey },
      { collection: 'otp_challenges', id: emailKey }
    ], ([ipSnap, challengeSnap]) => {
      const ipData = ipSnap.data || {};
      const challengeData = challengeSnap.data || {};
      const ipWindowStart = Number(ipData.windowStart || 0);
      const ipCount = Number(ipData.count || 0);
      if (ipSnap.exists && now - ipWindowStart < HOURLY_WINDOW_MS && ipCount >= MAX_IP_OTP_PER_HOUR) return { writes: [], result: { blocked: 'ip' } };
      const lastSentAt = Number(challengeData.lastSentAt || 0);
      if (challengeSnap.exists && now - lastSentAt < RESEND_COOLDOWN_MS) {
        return { writes: [], result: { blocked: 'cooldown', retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000) } };
      }
      const emailWindowStart = Number(challengeData.windowStart || 0);
      const emailSendCount = challengeSnap.exists && now - emailWindowStart < HOURLY_WINDOW_MS ? Number(challengeData.sendCount || 0) : 0;
      if (emailSendCount >= MAX_EMAIL_OTP_PER_HOUR) return { writes: [], result: { blocked: 'email' } };
      const nextChallenge = {
        email, purpose, otpHash, salt, attempts: 0, maxAttempts: MAX_OTP_ATTEMPTS,
        createdAt: now, lastSentAt: now, expiresAt,
        windowStart: emailSendCount ? emailWindowStart : now, sendCount: emailSendCount + 1,
        clientIpHash, verified: false, consumedAt: null, status: 'active'
      };
      const nextIp = {
        windowStart: (!ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS) ? now : ipWindowStart,
        count: (!ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS) ? 1 : ipCount + 1,
        updatedAt: now
      };
      return { writes: [
        firestoreUpdateWrite('otp_challenges', emailKey, nextChallenge, { projectId: env.FIREBASE_PROJECT_ID, exists: challengeSnap.exists }),
        firestoreUpdateWrite('otp_rate_limits', ipKey, nextIp, { projectId: env.FIREBASE_PROJECT_ID, exists: ipSnap.exists })
      ], result: { ok: true } };
    });

    if (reservation.blocked === 'ip') return error(429, { code: 'RATE_LIMITED_IP', error: 'OTP တောင်းဆိုမှု အကြိမ်ရေ များနေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။' });
    if (reservation.blocked === 'cooldown') return error(429, { code: 'COOLDOWN_ACTIVE', retryAfterSeconds: reservation.retryAfterSeconds, error: `OTP ကုဒ်အသစ် ထပ်မံတောင်းဆိုရန် ${reservation.retryAfterSeconds} စက္ကန့် စောင့်ဆိုင်းပေးပါ။` });
    if (reservation.blocked === 'email') return error(429, { code: 'RATE_LIMITED_EMAIL', error: '၁ နာရီအတွင်း OTP တောင်းဆိုနိုင်သည့် အကြိမ်ရေ ပြည့်သွားပါပြီ။ နောက်မှ ပြန်လည်ကြိုးစားပါ။' });

    const payload = {
      service_id: serviceId, template_id: templateId, user_id: publicKey,
      template_params: {
        to_email: email, user_email: email, email, to_name: email.split('@')[0],
        otp_code: otpCode, passcode: otpCode, code: otpCode,
        shop_name: 'DD Fashion Boutique',
        purpose: purpose === 'register' ? 'Account Registration' : purpose === 'login' ? 'Login Verification' : 'Password Reset',
        expiry_minutes: '15',
        message: `သင်၏ DD Fashion Verification Code (OTP) မှာ ${otpCode} ဖြစ်ပါသည်။ (၁၅ မိနစ်အတွင်း အသုံးပြုပါ)`
      }
    };
    if (privateKey) payload.accessToken = privateKey;
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: request.headers.get('Origin') || env.SITE_URL || 'https://ddfashion.netlify.app' },
      body: JSON.stringify(payload)
    });
    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      await removeChallengeOnDeliveryFailure(env, emailKey, otpHash);
      console.error('Cloudflare EmailJS delivery failed:', emailResponse.status, errText.slice(0, 500));
      return error(502, { code: 'EMAIL_DELIVERY_FAILED', error: 'Email ပေးပို့ရာတွင် အခက်အခဲရှိနေပါသည်။ EmailJS Settings ကို စစ်ဆေးပါ။' });
    }
    return jsonResponse(200, {
      ok: true, email, purpose, expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
      message: `✓ ${email} သို့ ဂဏန်း (၆) လုံး OTP ကုဒ် ပေးပို့ပြီးပါပြီ! (၁၅ မိနစ်အတွင်း ရိုက်ထည့်ပါ)`
    });
  } catch (err) {
    console.error('Cloudflare send-otp error:', err);
    return error(500, { error: err.message || 'OTP ပေးပို့ရာတွင် Server အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။' });
  }
}

async function removeChallengeOnDeliveryFailure(env, emailKey, otpHash) {
  const { runFirestoreTransaction, firestoreDeleteWrite } = await import('../../cloudflare/firebase-rest.js');
  await runFirestoreTransaction(env, [{ collection: 'otp_challenges', id: emailKey }], ([snap]) => ({
    writes: snap.exists && snap.data.otpHash === otpHash
      ? [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)] : [],
    result: null
  }));
}
