'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
for (const rel of ['netlify/functions/send-otp.js','netlify/functions/send-otp.js']) {
  const s = read(rel);
  assert(s.includes('db.runTransaction'), `${rel}: OTP send must reserve quotas atomically`);
  assert(s.includes('tx.get(ipRef)') && s.includes('tx.get(challengeRef)'), `${rel}: both IP and email counters must be read in transaction`);
  assert(s.includes('tx.set(ipRef') && s.includes('tx.set(challengeRef'), `${rel}: both counters must be written atomically`);
}
for (const rel of ['netlify/functions/verify-otp.js','netlify/functions/verify-otp.js']) {
  const s = read(rel);
  assert(s.includes('db.runTransaction'), `${rel}: OTP verification must be atomic`);
  assert(s.includes("status: 'processing'") && s.includes('consumedAt: now'), `${rel}: successful OTP must be claimed once`);
  assert(s.includes('attempts: nextAttempts'), `${rel}: wrong attempts must update atomically`);
}
for (const rel of ['functions/api/chat-data.js','netlify/functions/chat-data.js']) {
  const s = read(rel);
  assert(s.includes("collection('customer_chats')"), `${rel}: per-customer chat collection required`);
  assert(s.includes('decoded.uid'), `${rel}: chat must bind to verified UID`);
  assert(s.includes("action === 'list'") && s.includes('if (!isAdmin)'), `${rel}: all-chat listing must be admin-only`);
}
for (const rel of ['functions/api/store-data.js','netlify/functions/store-data.js']) {
  const s = read(rel);
  const a = s.indexOf('async function verifyAdminRequest');
  const b = s.indexOf('async function ensurePromoCouponCounter', a);
  const fn = s.slice(a,b);
  assert(fn.includes("collection('users').doc(decoded.uid)"), `${rel}: admin authorization must use current profile`);
  assert(!fn.includes('resolveServerRole(email)'), `${rel}: Admin APIs must not use a second allowlist`);
}
const rules = read('firestore.rules');
assert(rules.includes("docId in ['settings', 'reward_settings', 'stocklogs']"), 'legacy global chat document must not be public-readable');
assert(rules.includes('match /customer_chats/{userId} { allow read, write: if false; }'), 'chat access must be server-mediated');
assert(!rules.includes("'sailate449@gmail.com'"), 'Firestore rules must not duplicate admin email allowlist');
console.log('Chat + OTP security hardening tests passed.');
