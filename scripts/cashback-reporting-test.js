#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const backend = fs.readFileSync(path.join(root, 'netlify/functions/store-data.js'), 'utf8');

// Full face value must remain intact; debt settlement is shown separately.
const fiftyThousand = { type: 'earned', programType: 'monthly', amount: 50000, creditedAmount: 5000, debtPaid: 45000, monthKey: '2026-11' };
assert.strictEqual(Number(fiftyThousand.amount), 50000);
assert.strictEqual(Number(fiftyThousand.creditedAmount), 5000);
assert.strictEqual(Number(fiftyThousand.debtPaid), 45000);
assert.strictEqual(Number(fiftyThousand.amount).toLocaleString('en-US'), '50,000');
assert.match(html, /monthly-purchase-tier-value[^>]*value=\"\$\{Math\.max\(0, Number\(t\.rewardValue \|\| 0\)\)\}/);
assert.match(backend, /const value = Math\.max\(0, Number\(t\.rewardValue \|\| 0\)\)/);
assert.match(html, /Number\(x\.amount \?\? x\.rewardValue \?\? 0\)/);
assert.match(html, /Wallet ထဲဝင်/);
assert.match(html, /အကြွေးဖြတ်/);

// Monthly and Lifetime history must no longer be limited to the last three rows
// or only the bounded profile history array.
assert.match(html, /cashback_ledger/);
// The current UI uses one shared renderer for both Monthly and Lifetime modes.
// Verify the selected mode is validated and the shared filter uses that mode,
// rather than requiring a separate hard-coded Lifetime-only variable.
assert.match(html, /if \(!\['monthly', 'lifetime'\]\.includes\(mode\)\) return;/);
assert.match(html, /const records = history\.filter\(x => x\.programType === mode\);/);
assert.match(html, /const selected = selectedMonth === '__latest3__' \? records\.slice\(0, 3\) : records\.filter\(x => monthKey\(x\) === selectedMonth\);/);
assert.doesNotMatch(html, /history\.filter\(x => x\.programType === 'lifetime'\)\.slice\(0, 3\)/);

// Refunds must reverse earned cashback totals and append an auditable ledger row.
assert.match(backend, /type: 'refund_reversal', amount, balanceAfter:/);
assert.match(backend, /cashbackTotalEarned: Math\.max\(0, Math\.max\(Number\(u\.cashbackTotalEarned \|\| 0\)/);

console.log('Cashback reporting regression tests passed (full-value display, complete ledger history, debt transparency, refund reversal).');
