import {
  sha256Hex, normalizeEmail, runFirestoreTransaction, firestoreUpdateWrite,
  firestoreDeleteWrite, lookupFirebaseUserByEmail, createFirebaseUser,
  updateFirebaseUser, deleteFirebaseUser, createFirebaseCustomToken, resolveServerRole
} from '../../cloudflare/firebase-rest.js';

export const OTP_EXPIRY_MS = 15 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const HOURLY_WINDOW_MS = 60 * 60 * 1000;
export const MAX_EMAIL_OTP_PER_HOUR = 5;
export const MAX_IP_OTP_PER_HOUR = 15;

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export function getClientIp(request) {
  return String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown').split(',')[0].trim();
}

export function generateSixDigitOtp() {
  const bytes = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / 900000) * 900000;
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return String(100000 + (bytes[0] % 900000));
}

export function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map(v => v.toString(16).padStart(2, '0')).join('');
}

export async function hashOtpWithSalt(otp, salt, env) {
  const pepper = String(env.FIREBASE_PRIVATE_KEY || '').slice(0, 32) || 'ddfashion-otp-pepper-2026';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${salt}:${String(otp).trim()}`));
  return [...new Uint8Array(signature)].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqualHex(a, b) {
  const left = String(a || '').toLowerCase();
  const right = String(b || '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(left) || !/^[0-9a-f]{64}$/.test(right)) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export function getEmailJsConfig(env) {
  const serviceId = String(env.EMAILJS_SERVICE_ID || '').trim();
  const templateId = String(env.EMAILJS_TEMPLATE_ID || '').trim();
  const publicKey = String(env.EMAILJS_PUBLIC_KEY || '').trim();
  const privateKey = String(env.EMAILJS_PRIVATE_KEY || '').trim();
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Missing EmailJS environment variables (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY).');
  }
  return { serviceId, templateId, publicKey, privateKey };
}

export function otpChallengeId(purpose, emailHash) { return `${purpose}_${emailHash}`; }

export async function removeChallengeIfCurrent(env, emailKey, expectedHash) {
  const ref = { collection: 'otp_challenges', id: emailKey };
  await runFirestoreTransaction(env, [ref], ([snap]) => {
    if (!snap.exists || snap.data.otpHash !== expectedHash) return { writes: [], result: null };
    return { writes: [firestoreDeleteWrite('otp_challenges', emailKey, env.FIREBASE_PROJECT_ID)], result: null };
  });
}

export async function createCustomTokenForUser(env, uid, email) {
  const role = resolveServerRole(email, env);
  return { role, customToken: await createFirebaseCustomToken(env, uid, { role }) };
}

export {
  sha256Hex, normalizeEmail, runFirestoreTransaction, firestoreUpdateWrite,
  firestoreDeleteWrite, lookupFirebaseUserByEmail, createFirebaseUser,
  updateFirebaseUser, deleteFirebaseUser, createFirebaseCustomToken, resolveServerRole
};
