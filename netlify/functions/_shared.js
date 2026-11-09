const crypto = require('crypto');
const admin = require('firebase-admin');

const OTP_EXPIRY_MS = 15 * 60 * 1000;      // 15 minutes strict expiry
const RESEND_COOLDOWN_MS = 60 * 1000;      // 60 seconds cooldown between OTP requests
const MAX_OTP_ATTEMPTS = 5;                // Max 5 wrong attempts per OTP
const HOURLY_WINDOW_MS = 60 * 60 * 1000;   // 1 hour rate-limit window
const MAX_EMAIL_OTP_PER_HOUR = 5;          // Max 5 OTP emails per address per hour
const MAX_IP_OTP_PER_HOUR = 15;            // Max 15 OTP requests per IP per hour

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error('Missing Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

function getEmailJsConfig() {
  const serviceId = (process.env.EMAILJS_SERVICE_ID || '').trim();
  const templateId = (process.env.EMAILJS_TEMPLATE_ID || '').trim();
  const publicKey = (process.env.EMAILJS_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.EMAILJS_PRIVATE_KEY || '').trim();

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'Missing EmailJS environment variables (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY) in Netlify.'
    );
  }

  return { serviceId, templateId, publicKey, privateKey };
}

function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hashOtpWithSalt(otp, salt) {
  const secretPepper = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.slice(0, 32)
    : 'ddfashion-otp-pepper-2026';
  return crypto
    .createHmac('sha256', secretPepper)
    .update(`${salt}:${String(otp).trim()}`)
    .digest('hex');
}

function constantTimeEqualHex(hexA, hexB) {
  try {
    const bufA = Buffer.from(String(hexA || ''), 'hex');
    const bufB = Buffer.from(String(hexB || ''), 'hex');
    if (bufA.length === 0 || bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

function generateSixDigitOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function getClientIp(event) {
  const headers = (event && event.headers) || {};
  const raw =
    headers['x-nf-client-connection-ip'] ||
    headers['x-forwarded-for'] ||
    headers['client-ip'] ||
    'unknown';
  return String(raw).split(',')[0].trim();
}

function resolveServerRole(email) {
  const clean = normalizeEmail(email);
  const masterList = String(process.env.ADMIN_MASTER_EMAIL || 'sailate449@gmail.com')
    .split(',')
    .map(s => normalizeEmail(s))
    .filter(Boolean);
  const staffList = String(process.env.ADMIN_STAFF_EMAIL || 'staff@gmail.com')
    .split(',')
    .map(s => normalizeEmail(s))
    .filter(Boolean);

  if (masterList.includes(clean)) return 'admin_master';
  if (staffList.includes(clean)) return 'admin_staff';
  return 'customer';
}

module.exports = {
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
  constantTimeEqualHex,
  generateSixDigitOtp,
  getClientIp,
  resolveServerRole
};
