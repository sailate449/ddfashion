const {
  MAX_OTP_ATTEMPTS,
  JSON_HEADERS,
  admin,
  initFirebaseAdmin,
  normalizeEmail,
  isValidEmail,
  sha256Hex,
  hashOtpWithSalt,
  constantTimeEqualHex,
  resolveServerRole
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
    const otp = String(body.otp || '').trim();
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');
    const purpose = ['reset', 'login'].includes(body.purpose) ? body.purpose : 'register';
    const action = body.action || (purpose === 'register' ? 'create_account' : 'verify_only');

    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'မှန်ကန်သော Email လိပ်စာ ထည့်သွင်းပေးပါရန်။' })
      };
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'ဂဏန်း (၆) လုံးပါဝင်သော OTP ကုဒ်ကို အတိအကျ ရိုက်ထည့်ပေးပါ။' })
      };
    }

    if (purpose === 'register' && password !== confirmPassword) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Password နှင့် Confirm Password မတူညီပါ။' }) };
    }

    if ((purpose === 'register' || action === 'reset_password') && password.length < 6) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Password သည် အနည်းဆုံး (၆) လုံး ရှိရပါမည်။' })
      };
    }

    initFirebaseAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    const emailKey = `${purpose}_${sha256Hex(email)}`;
    const challengeRef = db.collection('otp_challenges').doc(emailKey);
    const now = Date.now();

    // Verify and consume/update the challenge in one Firestore transaction.
    // This prevents parallel requests from racing the attempt counter or using
    // one correct OTP more than once.
    const verification = await db.runTransaction(async (tx) => {
      const snap = await tx.get(challengeRef);
      if (!snap.exists) return { error: 'not_found' };
      const challengeData = snap.data() || {};
      if (!challengeData.expiresAt || now > Number(challengeData.expiresAt)) {
        tx.delete(challengeRef);
        return { error: 'expired' };
      }
      if (challengeData.consumedAt || challengeData.status === 'consumed' || challengeData.status === 'processing') {
        return { error: 'consumed' };
      }

      const currentAttempts = Number(challengeData.attempts || 0);
      const maxAttempts = Number(challengeData.maxAttempts || MAX_OTP_ATTEMPTS);
      if (currentAttempts >= maxAttempts) {
        tx.delete(challengeRef);
        return { error: 'max_attempts' };
      }

      const computedHash = hashOtpWithSalt(otp, challengeData.salt);
      const isMatch = constantTimeEqualHex(computedHash, challengeData.otpHash);
      if (!isMatch) {
        const nextAttempts = currentAttempts + 1;
        if (nextAttempts >= maxAttempts) {
          tx.delete(challengeRef);
          return { error: 'max_attempts', remainingAttempts: 0 };
        }
        tx.update(challengeRef, { attempts: nextAttempts, lastAttemptAt: now });
        return { error: 'invalid', remainingAttempts: maxAttempts - nextAttempts };
      }

      // Password reset deliberately keeps the verified challenge until the
      // second step submits the new password; all other successful flows claim it.
      if (purpose === 'reset' && action === 'verify_only') {
        tx.update(challengeRef, { verified: true, verifiedAt: now, status: 'verified' });
      } else {
        tx.update(challengeRef, { status: 'processing', consumedAt: now, consumedBy: 'verify-otp' });
      }
      return { ok: true, challenge: challengeData };
    });

    if (verification.error === 'not_found' || verification.error === 'consumed') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'OTP_NOT_FOUND', error: 'OTP ကုဒ် မတွေ့ရှိပါ သို့မဟုတ် အသုံးပြုပြီးဖြစ်ပါသည်။ ကုဒ်အသစ် ပြန်တောင်းပါ။' }) };
    }
    if (verification.error === 'expired') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'OTP_EXPIRED', error: 'OTP ကုဒ် သက်တမ်း (၁၅ မိနစ်) ကုန်ဆုံးသွားပါပြီ။ ကုဒ်အသစ် ပြန်လည်တောင်းဆိုပါ။' }) };
    }
    if (verification.error === 'max_attempts') {
      return { statusCode: 429, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'MAX_ATTEMPTS_EXCEEDED', remainingAttempts: 0, error: 'OTP ကုဒ် မှားယွင်းမှု (၅) ကြိမ် ပြည့်သွားပါပြီ။ လုံခြုံရေးအရ ကုဒ်အသစ် ပြန်လည်တောင်းဆိုပါ။' }) };
    }
    if (verification.error === 'invalid') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'INVALID_OTP', remainingAttempts: verification.remainingAttempts, error: `ထည့်သွင်းထားသော OTP ကုဒ် မှားယွင်းနေပါသည်။ (ထပ်မံကြိုးစားခွင့် ${verification.remainingAttempts} ကြိမ် ကျန်ပါသည်)` }) };
    }
    if (verification.error === 'not_verified') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'OTP_NOT_VERIFIED', error: 'Password ပြောင်းရန် OTP ကို အရင်အတည်ပြုပေးပါ။' }) };
    }
    const challenge = verification.challenge || {};

    // Login OTP is a first-factor email verification. Consume it before the
    // frontend checks the existing password with Firebase Authentication.
    if (purpose === 'login' && action === 'verify_only') {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          await challengeRef.delete();
          return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, code: 'USER_NOT_FOUND', error: 'ဤ Email ဖြင့် အကောင့်မတွေ့ပါ။' }) };
        }
        throw err;
      }
      await challengeRef.delete();
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: true, verified: true, email, uid: userRecord.uid, message: 'Email OTP အတည်ပြုခြင်း အောင်မြင်ပါသည်။ Password ဆက်လက်ထည့်သွင်းပါ။' })
      };
    }

    // 4. Handle Password Reset Step-1 (Verify Only)
    if (purpose === 'reset' && action === 'verify_only') {
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: true,
          verified: true,
          email,
          message: 'OTP ကုဒ် မှန်ကန်ပါသည်! Password အသစ်ပေးနိုင်ပါပြီ။'
        })
      };
    }

    // 5. Handle Password Reset Step-2 (Update Password or Direct OTP Login)
    if (purpose === 'reset' && (action === 'reset_password' || action === 'direct_login')) {
      const userRecord = await auth.getUserByEmail(email);
      if (action === 'reset_password') {
        await auth.updateUser(userRecord.uid, {
          password,
          emailVerified: true
        });
      }
      const role = resolveServerRole(email);
      await auth.setCustomUserClaims(userRecord.uid, { role });
      await db.collection('users').doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email,
          role,
          emailVerified: true,
          updatedAt: now
        },
        { merge: true }
      );

      await challengeRef.delete();
      const customToken = await auth.createCustomToken(userRecord.uid, { role });

      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: true,
          uid: userRecord.uid,
          email,
          role,
          customToken,
          message: action === 'reset_password'
            ? 'Password အသစ်ပြောင်းလဲပြီး အကောင့်ဝင်ရောက်ပါပြီ!'
            : 'OTP ကုဒ်ဖြင့် အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်!'
        })
      };
    }

    // 6. Handle Registration: Create Firebase Account ONLY AFTER OTP is Verified!
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(email);
    } catch (err) {
      if (err.code !== 'auth/user-not-found') throw err;
    }

    if (existingUser) {
      await challengeRef.delete();
      return {
        statusCode: 409,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          code: 'EMAIL_EXISTS',
          error: 'ဤ Email ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။ Login ဝင်ပါ။'
        })
      };
    }

    const assignedRole = resolveServerRole(email);
    const assignedName =
      assignedRole === 'admin_master'
        ? 'Master Admin'
        : assignedRole === 'admin_staff'
        ? 'Staff Member'
        : email.split('@')[0];

    const createdUser = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: assignedName
    });

    await auth.setCustomUserClaims(createdUser.uid, { role: assignedRole });

    // Firebase Auth guarantees unique emails and UIDs. Keep an explicit,
    // server-only immutable email -> UID index and verify the reverse mapping.
    const emailMapRef = db.collection('email_uid_map').doc(sha256Hex(email));
    const userRef = db.collection('users').doc(createdUser.uid);
    try {
      await db.runTransaction(async (tx) => {
        const mapSnap = await tx.get(emailMapRef);
        const userSnap = await tx.get(userRef);
        if (mapSnap.exists && mapSnap.data().uid !== createdUser.uid) {
          const conflict = new Error('ဤ Email သည် အခြား UID တစ်ခုနှင့် ချိတ်ဆက်ပြီးသားဖြစ်ပါသည်။');
          conflict.code = 'EMAIL_UID_CONFLICT';
          throw conflict;
        }
        if (userSnap.exists && normalizeEmail(userSnap.data().email) !== email) {
          const conflict = new Error('ဤ UID သည် အခြား Email တစ်ခုနှင့် ချိတ်ဆက်ပြီးသားဖြစ်ပါသည်။');
          conflict.code = 'UID_EMAIL_CONFLICT';
          throw conflict;
        }
        tx.create(emailMapRef, { email, uid: createdUser.uid, createdAt: now });
        tx.set(userRef, {
          uid: createdUser.uid,
          email,
          emailKey: sha256Hex(email),
          name: assignedName,
          role: assignedRole,
          emailVerified: true,
          createdAt: now,
          updatedAt: now
        });
      });
    } catch (mappingError) {
      await auth.deleteUser(createdUser.uid).catch((cleanupError) => {
        console.error('Failed to clean up account after email/UID mapping error:', cleanupError);
      });
      throw mappingError;
    }

    // Delete OTP challenge immediately after successful account creation
    await challengeRef.delete();

    // Mint a Firebase Custom Token so frontend can sign in seamlessly
    const customToken = await auth.createCustomToken(createdUser.uid, { role: assignedRole });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: true,
        uid: createdUser.uid,
        email,
        name: assignedName,
        role: assignedRole,
        customToken,
        message: 'OTP အတည်ပြုပြီး Firebase အကောင့်အသစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်!'
      })
    };
  } catch (err) {
    console.error('verify-otp error:', err);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err.message || 'OTP အတည်ပြုရာတွင် Server အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။'
      })
    };
  }
};
