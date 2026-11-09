const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const backend = fs.readFileSync(path.join(root, 'netlify/functions/store-data.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');

assert.match(backend, /function isOrderRefunded\(order = \{\}\)/, 'Legacy refund normalization helper must exist');
assert.match(backend, /order\.refunded === true/, 'Legacy boolean refunded flag must disqualify review rewards');
assert.match(backend, /refundStatus === 'refunded'/, 'Refund status field must disqualify review rewards');
assert.match(backend, /text\.length < 20/, 'Backend must reject reviews shorter than 20 characters');
assert.match(html, /id="reviewTextInput" required minlength="20"/, 'Review form must communicate the same minimum length');
assert.match(backend, /if \(isOrderRefunded\(order\)\) return false/, 'Customer review reward eligibility must reject refunded completed orders');
assert.match(backend, /if \(isOrderRefunded\(orderNow\)/, 'Delayed reward-on-completion must reject refunded orders');
assert.match(backend, /String\(other\.status \|\| ''\)\.toLowerCase\(\) !== 'completed' \|\| isOrderRefunded\(other\)/, 'Refund alternate-purchase checks must reject legacy refunded orders');
assert.match(backend, /review_reward_moderation_reversal/, 'Admin hide/delete must create a moderation reversal ledger entry');
assert.match(backend, /pointsDebtAfter = Math\.max\(0, Number\(userData\.pointsDebt \|\| 0\)\) \+ debtAdded/, 'Spent review points must become debt');
assert.match(backend, /reversalReason: modAction === 'delete' \? 'review_deleted' : 'review_hidden'/, 'Review delete/hide must mark the permanent reward claim as reversed');
assert.match(backend, /pointsRewarded: false, pointsAwarded: 0, pointsReversedAt:/, 'Moderated review must no longer retain an awarded flag');
assert.match(backend, /type: 'review_reward_refund'/, 'Order refund reversal path must remain in place');
assert.match(rules, /match \/reviews\/\{reviewId\}[\s\S]*allow create, update, delete: if false;/, 'Clients must not write review documents directly');
assert.match(rules, /match \/review_reward_claims\/\{claimId\} \{ allow read, write: if false; \}/, 'Clients must not write reward claims');
assert.match(rules, /match \/points_ledger\/\{entryId\}[\s\S]*allow write: if false;/, 'Clients must not write points ledger entries');
assert.match(rules, /'pointsBalance', 'pointsDebt', 'totalPointsEarned'/, 'Customers must not directly edit point balances or debt');
// Photo Bonus policy is intentionally unchanged: configured bonus applies only at 4★+.
assert.match(backend, /if \(rating >= 4 && photos\.length > 0 && Number\(rewardCfg\.photoBonusPoints \|\| 0\) > 0\)/, 'Immediate Photo Bonus policy must remain unchanged');
assert.match(backend, /if \(stars >= 4 && verifiedPhotos\.length && Number\(config\.photoBonusPoints \|\| 0\) > 0\)/, 'Delayed Photo Bonus policy must remain unchanged');

console.log('Review-points safety static checks passed.');
