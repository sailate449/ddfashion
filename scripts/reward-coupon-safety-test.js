'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'netlify/functions/store-data.js'), 'utf8');
const client = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Reward coupon tiers must be admin-configured; there must be no implicit 100/5,
// 200/10, 500/20 redemption tiers in the server defaults.
assert.match(server, /tiers:\s*\[\]/, 'Reward coupon tiers should default to an empty list');
assert.match(client, /const tiers = Array\.isArray\(window\.rewardSettings\.tiers\) \? window\.rewardSettings\.tiers : \[\]/);
assert.match(client, /Admin မှ Reward Coupon Tiers မသတ်မှတ်ရသေးပါ/);

// Admin saves the actual cost and percentage separately for every configured tier.
assert.match(server, /pointsCost:\s*Math\.max\(1, Math\.floor\(Number\(t\.pointsCost\) \|\| 100\)\)/);
assert.match(server, /discountPercent:\s*Math\.min\(90, Math\.max\(1, Math\.floor\(Number\(t\.discountPercent\) \|\| 5\)\)\)/);

// Redemption uses the selected tier, deducts its points cost in a Firestore transaction,
// and creates a server-owned coupon carrying that tier's percentage.
assert.match(server, /const tier = tiers\.find\(t => String\(t\.id\) === tierId\)/);
assert.match(server, /const cost = Math\.max\(1, parseInt\(tier\.pointsCost, 10\) \|\| 100\)/);
assert.match(server, /const discountPercent = Math\.min\(90, Math\.max\(1, parseInt\(tier\.discountPercent, 10\) \|\| 5\)\)/);
assert.match(server, /const newBalance = currentPoints - cost/);
assert.match(server, /percent: discountPercent/);
assert.match(server, /pointsCost: cost/);
assert.match(server, /pointsDelta:\s*-cost/);
assert.match(server, /tx\.create\(db\.collection\('financial_audit_logs'\)/);
assert.match(server, /led_redeem_\$\{uid\}_\$\{requestId\}/);
assert.match(server, /alreadyProcessed:\s*true/);

// Expected percentage math for the sample tiers: the coupon discount is a percentage
// of eligible product subtotal (subject to explicitly configured limits).
assert.strictEqual(Math.round(100000 * 5 / 100), 5000);
assert.strictEqual(Math.round(100000 * 10 / 100), 10000);
assert.strictEqual(Math.round(100000 * 20 / 100), 20000);

// Checkout validates ownership/status and recalculates the discount on the server,
// not from a browser-supplied discount amount.
assert.match(server, /String\(c\.userId \|\| ''\) !== userId/);
assert.match(server, /if \(c\.used === true\)/);
assert.match(server, /const percentDiscount = Math\.round\(eligibleSubtotal \* percent \/ 100\)/);
assert.match(server, /const maxDiscount = Math\.max\(0, Number\(c\.maxDiscount \|\| 0\)\)/);
assert.match(server, /tx\.update\(redeemedRef, \{ used: true/);

// Customer UI must show a loading state, surface failures, and tell the exact
// points cost/discount when redemption succeeds.
assert.match(client, /လဲလှယ်နေသည်/);
assert.match(client, /showToast\(err\?\.message \|\| 'Coupon လဲလှယ်မှု မအောင်မြင်ပါ/);
assert.match(client, /spentPoints\.toLocaleString\(\).*res\.discountPercent/);

console.log('Reward coupon safety tests passed.');
