'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

for (const rel of ['functions/api/store-data.js', 'netlify/functions/store-data.js']) {
  const source = read(rel);
  const start = source.indexOf("if (action === 'customer_create_order')");
  const end = source.indexOf("if (action === 'customer_add_review')", start);
  assert(start >= 0 && end > start, `${rel}: checkout handler must exist`);
  const checkout = source.slice(start, end);
  assert(checkout.includes('const customer = await verifyCustomerToken(event);'), `${rel}: checkout must require a verified Firebase user`);
  assert(checkout.includes('const userId = customer.uid;'), `${rel}: order owner must come from verified token`);
  assert(!checkout.includes("guest_"), `${rel}: unauthenticated guest checkout must not be accepted`);
  assert(checkout.includes('requestedUserId !== customer.uid'), `${rel}: reject mismatched client user IDs`);
  const adminStart = source.indexOf('async function verifyAdminRequest');
  const adminEnd = source.indexOf('async function ensurePromoCouponCounter', adminStart);
  const adminCheck = source.slice(adminStart, adminEnd);
  assert(!adminCheck.includes('decoded.role'), `${rel}: stale custom role claims must not authorize Admin actions`);
}
const firestore = read('firestore.rules');
const firestoreAdmin = firestore.slice(firestore.indexOf('function isAdmin()'), firestore.indexOf('function isOwner'));
assert(!firestoreAdmin.includes('request.auth.token.role'), 'Firestore rules must not trust stale role claims');
const storage = read('storage.rules');
const storageAdmin = storage.slice(storage.indexOf('function isAdmin()'), storage.indexOf('match /reviews'));
assert(!storageAdmin.includes('request.auth.token.role'), 'Storage rules must not trust stale role claims');
console.log('Backend security audit regression tests passed (authenticated checkout, owner binding, stale admin-claim rejection).');
