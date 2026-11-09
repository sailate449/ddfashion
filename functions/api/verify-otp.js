import { jsonResponse } from '../../cloudflare/firebase-rest.js';
import {
  MAX_OTP_ATTEMPTS, isValidEmail, hashOtpWithSalt, constantTimeEqualHex,
  otpChallengeId, sha256Hex, normalizeEmail, runFirestoreTransaction,
  firestoreUpdateWrite, firestoreDeleteWrite, lookupFirebaseUserByEmail,
  createFirebaseUser, updateFirebaseUser, deleteFirebaseUser,
  createFirebaseCustomToken, resolveServerRole
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
    const otp = String(body.otp || '').trim();
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');
    const purpose = ['reset', 'login'].includes(body.purpose) ? body.purpose : 'register';
    const action = body.action || (purpose === 'register' ? 'create_account' : 'verify_only');

    if (!isValidEmail(email)) return error(400, { error: 'မှန်ကန်သော Email လိပ်စာ ထည့်သွင်းပေးပါရန်။' });
    if (!/^[0-9]{6}$/.test(otp)) return error(400, { error: 'ဂဏန်း (၆) လုံးပါဝင်သော OTP ကုဒ်ကို အတိအကျ ရိုက်ထည့်ပေးပါ။' });
    if (purpose === 'register' && password !== confirmPassword) return error(400, { error: 'Password နှင့် Confirm Password မတူညီပါ။' });
    if ((purpose === 'register' || action === 'reset_password') && password.length < 6) return error(400, { error: 'Password သည် အနည်းဆုံး (၆) လုံး ရှိရပါမည်။' });
    if (!['create_account', 'verify_only', 'reset_password', 'direct_login'].includes(action)) return error(400, { error: 'Invalid OTP action.' });
    if ((purpose === 'register' && action !== 'create_account') || (purpose === 'login' && action !== 'verify_only') || (purpose === 'reset' && !['verify_only', 'reset_password', 'direct_login'].includes(action))) return error(400, { error: 'OTP purpose and action do not match.' });

    const emailKey = otpChallengeId(purpose, await sha256Hex(email));
    const now = Date.now();
    const verification = await runFirestoreTransaction(env, [{ collection: 'otp_challenges', id: emailKey }], async ([snap]) => {
      if (!snap.exists) return { writes: [], result: { error: 'not_found' } };
      const challenge = snap.data || {};
      if (!challenge.expiresAt || now > Number(challenge.expiresAt)) {
        return { writes: [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)], result: { error: 'expired' } };
      }
      if (challenge.consumedAt || challenge.status === 'consumed' || challenge.status === 'processing') return { writes: [], result: { error: 'consumed' } };
      const currentAttempts = Number(challenge.attempts || 0);
      const maxAttempts = Number(challenge.maxAttempts || MAX_OTP_ATTEMPTS);
      if (currentAttempts >= maxAttempts) {
        return { writes: [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)], result: { error: 'max_attempts' } };
      }
      const computedHash = await hashOtpWithSalt(otp, challenge.salt, env);
      if (!constantTimeEqualHex(computedHash, challenge.otpHash)) {
        const nextAttempts = currentAttempts + 1;
        if (nextAttempts >= maxAttempts) {
          return { writes: [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)], result: { error: 'max_attempts', remainingAttempts: 0 } };
        }
        return { writes: [firestoreUpdateWrite('otp_challenges', emailKey, { attempts: nextAttempts, lastAttemptAt: now }, { projectId: env.FIREBASE_PROJECT_ID, fieldPaths: ['attempts', 'lastAttemptAt'] })], result: { error: 'invalid', remainingAttempts: maxAttempts - nextAttempts } };
      }
      if (purpose === 'reset' && action === 'verify_only') {
        return { writes: [firestoreUpdateWrite('otp_challenges', emailKey, { verified: true, verifiedAt: now, status: 'verified' }, { projectId: env.FIREBASE_PROJECT_ID, fieldPaths: ['verified', 'verifiedAt', 'status'] })], result: { ok: true, challenge } };
      }
      if (purpose === 'reset' && (action === 'reset_password' || action === 'direct_login') && challenge.verified !== true) {
        return { writes: [], result: { error: 'not_verified' } };
      }
      return { writes: [firestoreUpdateWrite('otp_challenges', emailKey, { status: 'processing', consumedAt: now, consumedBy: 'verify-otp' }, { projectId: env.FIREBASE_PROJECT_ID, fieldPaths: ['status', 'consumedAt', 'consumedBy'] })], result: { ok: true, challenge } };
    });

    if (verification.error === 'not_found' || verification.error === 'consumed') return error(400, { code: 'OTP_NOT_FOUND', error: 'OTP ကုဒ် မတွေ့ရှိပါ သို့မဟုတ် အသုံးပြုပြီးဖြစ်ပါသည်။ ကုဒ်အသစ် ပြန်တောင်းပါ။' });
    if (verification.error === 'expired') return error(400, { code: 'OTP_EXPIRED', error: 'OTP ကုဒ် သက်တမ်း (၁၅ မိနစ်) ကုန်ဆုံးသွားပါပြီ။ ကုဒ်အသစ် ပြန်လည်တောင်းဆိုပါ။' });
    if (verification.error === 'max_attempts') return error(429, { code: 'MAX_ATTEMPTS_EXCEEDED', remainingAttempts: 0, error: 'OTP ကုဒ် မှားယွင်းမှု (၅) ကြိမ် ပြည့်သွားပါပြီ။ လုံခြုံရေးအရ ကုဒ်အသစ် ပြန်လည်တောင်းဆိုပါ။' });
    if (verification.error === 'invalid') return error(400, { code: 'INVALID_OTP', remainingAttempts: verification.remainingAttempts, error: `ထည့်သွင်းထားသော OTP ကုဒ် မှားယွင်းနေပါသည်။ (ထပ်မံကြိုးစားခွင့် ${verification.remainingAttempts} ကြိမ် ကျန်ပါသည်)` });
    if (verification.error === 'not_verified') return error(400, { code: 'OTP_NOT_VERIFIED', error: 'Password ပြောင်းရန် OTP ကို အရင်အတည်ပြုပေးပါ။' });
    const challenge = verification.challenge || {};

    if (purpose === 'login') {
      const user = await lookupFirebaseUserByEmail(env, email);
      if (!user) {
        await deleteChallenge(env, emailKey);
        return error(404, { code: 'USER_NOT_FOUND', error: 'ဤ Email ဖြင့် အကောင့်မတွေ့ပါ။' });
      }
      await deleteChallenge(env, emailKey);
      return jsonResponse(200, { ok: true, verified: true, email, uid: user.localId, message: 'Email OTP အတည်ပြုခြင်း အောင်မြင်ပါသည်။ Password ဆက်လက်ထည့်သွင်းပါ။' });
    }

    if (purpose === 'reset' && action === 'verify_only') {
      return jsonResponse(200, { ok: true, verified: true, email, message: 'OTP ကုဒ် မှန်ကန်ပါသည်! Password အသစ်ပေးနိုင်ပါပြီ။' });
    }

    if (purpose === 'reset') {
      const user = await lookupFirebaseUserByEmail(env, email);
      if (!user) { await deleteChallenge(env, emailKey); return error(404, { code: 'USER_NOT_FOUND', error: 'ဤ Email ဖြင့် အကောင့်မတွေ့ပါ။' }); }
      const role = resolveServerRole(email, env);
      if (action === 'reset_password') {
        await updateFirebaseUser(env, { localId: user.localId, password, emailVerified: true, customAttributes: JSON.stringify({ role }) });
      } else {
        await updateFirebaseUser(env, { localId: user.localId, emailVerified: true, customAttributes: JSON.stringify({ role }) });
      }
      await upsertUserProfile(env, user.localId, email, role, now, user.displayName || email.split('@')[0]);
      await deleteChallenge(env, emailKey);
      const customToken = await createFirebaseCustomToken(env, user.localId, { role });
      return jsonResponse(200, { ok: true, uid: user.localId, email, role, customToken,
        message: action === 'reset_password' ? 'Password အသစ်ပြောင်းလဲပြီး အကောင့်ဝင်ရောက်ပါပြီ!' : 'OTP ကုဒ်ဖြင့် အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်!' });
    }

    const existingUser = await lookupFirebaseUserByEmail(env, email);
    if (existingUser) {
      await deleteChallenge(env, emailKey);
      return error(409, { code: 'EMAIL_EXISTS', error: 'ဤ Email ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။ Login ဝင်ပါ။' });
    }

    const role = resolveServerRole(email, env);
    const name = role === 'admin_master' ? 'Master Admin' : role === 'admin_staff' ? 'Staff Member' : email.split('@')[0];
    const created = await createFirebaseUser(env, {
      email, password, emailVerified: true, displayName: name,
      customAttributes: JSON.stringify({ role })
    });
    const uid = created.localId;
    const emailHash = await sha256Hex(email);
    try {
      await runFirestoreTransaction(env, [
        { collection: 'email_uid_map', id: emailHash },
        { collection: 'users', id: uid }
      ], ([mapSnap, userSnap]) => {
        if (mapSnap.exists && mapSnap.data.uid !== uid) throw new Error('ဤ Email သည် အခြား UID တစ်ခုနှင့် ချိတ်ဆက်ပြီးသားဖြစ်ပါသည်။');
        if (userSnap.exists && normalizeEmail(userSnap.data.email) !== email) throw new Error('ဤ UID သည် အခြား Email တစ်ခုနှင့် ချိတ်ဆက်ပြီးသားဖြစ်ပါသည်။');
        const writes = [];
        if (!mapSnap.exists) writes.push(firestoreUpdateWrite('email_uid_map', emailHash, { email, uid, createdAt: now }, { projectId: env.FIREBASE_PROJECT_ID, exists: false }));
        const profile = { uid, email, emailKey: emailHash, name, role, emailVerified: true, createdAt: now, updatedAt: now };
        writes.push(firestoreUpdateWrite('users', uid, profile, { projectId: env.FIREBASE_PROJECT_ID, exists: userSnap.exists }));
        return { writes, result: true };
      });
    } catch (mappingError) {
      await deleteFirebaseUser(env, uid).catch(cleanupError => console.error('Cloudflare user cleanup failed:', cleanupError));
      throw mappingError;
    }
    await deleteChallenge(env, emailKey);
    const customToken = await createFirebaseCustomToken(env, uid, { role });
    return jsonResponse(200, { ok: true, uid, email, name, role, customToken, message: 'OTP အတည်ပြုပြီး Firebase အကောင့်အသစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်!' });
  } catch (err) {
    console.error('Cloudflare verify-otp error:', err);
    if (err.authCode && /EMAIL_EXISTS/.test(err.authCode)) return error(409, { code: 'EMAIL_EXISTS', error: 'ဤ Email ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။ Login ဝင်ပါ။' });
    return error(500, { error: err.message || 'OTP အတည်ပြုရာတွင် Server အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။' });
  }
}

async function deleteChallenge(env, emailKey) {
  await runFirestoreTransaction(env, [{ collection: 'otp_challenges', id: emailKey }], ([snap]) => ({
    writes: snap.exists ? [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)] : [], result: null
  }));
}

async function upsertUserProfile(env, uid, email, role, now, name) {
  await runFirestoreTransaction(env, [{ collection: 'users', id: uid }], ([snap]) => {
    const data = { uid, email, role, emailVerified: true, updatedAt: now };
    if (!snap.exists) Object.assign(data, { name, pointsBalance: 0, totalPointsEarned: 0, createdAt: now });
    return { writes: [firestoreUpdateWrite('users', uid, data, { projectId: env.FIREBASE_PROJECT_ID, fieldPaths: Object.keys(data), exists: snap.exists })], result: null };
  });
}
