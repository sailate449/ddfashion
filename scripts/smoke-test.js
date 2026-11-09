const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const files = ['index.html','cloudflare/firebase-rest.js','functions/api/_cf-adapter.js','functions/api/_financial-safety.js','functions/api/_otp.js','functions/api/store-data.js','functions/api/chat-data.js','functions/api/imagekit-upload.js','functions/api/imagekit-auth.js','functions/api/send-otp.js','functions/api/verify-otp.js','functions/api/user-session.js','netlify/functions/store-data.js','netlify/functions/financial-safety.js','netlify/functions/imagekit-upload.js','netlify/functions/imagekit-auth.js','netlify/functions/_shared.js','netlify/functions/send-otp.js','netlify/functions/verify-otp.js','netlify/functions/user-session.js'];
for (const f of files) {
  const full = path.join(root, f); if (!fs.existsSync(full)) throw new Error(`Missing required file: ${f}`);
  if (f.endsWith('.js')) cp.execFileSync(process.execPath, ['--check', full]);
}
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(match => match[1]).filter(code => code.trim());
inlineScripts.forEach((code, index) => new vm.Script(code, { filename: `index-inline-${index}.js` }));
const store = fs.readFileSync(path.join(root,'netlify/functions/store-data.js'),'utf8');
const rules = fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
const firebase = JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));
const required = [
  ['checkout points UI', 'coPointsUseInput'], ['admin points conversion', 'cfgPointsPer1000Ks'],
  ['minimum payable UI', 'cfgMinPayableAmount'],
  ['coupon total usage limit UI', 'couponTotalUsageLimitInput'],
  ['no automatic coupon total usage cap UI', 'value="0" class="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"></label>'],
  ['coupon per-customer limit UI', 'couponPerUserUsageLimitInput'],
  ['stacking controls UI', 'cfgAllowCouponWithPoints'],
  ['financial discount cap UI', 'cfgMaxTotalDiscountPercent'],
  ['absolute discount cap UI', 'cfgMaxTotalDiscountAmount'],
  ['coupon cashback stacking control UI', 'cfgAllowCouponWithCashback'],
  ['points cashback stacking control UI', 'cfgAllowPointsWithCashback'],
  ['review points cap UI', 'cfgMaxReviewPointsPerReview'],
  ['financial audit log UI', 'adminFinancialAuditLogList'],
  ['reward coupon redemption audit visible', 'reward_coupon_redeemed'],
  ['checkout stacking UI enforcement', 'couponAllowsPoints'],
  ['checkout cashback stacking UI enforcement', 'couponAllowsCashback'],
  ['checkout combined discount cap UI enforcement', 'getCheckoutTotalDiscountCap'], ['server points redemption', 'checkout_redemption'],
  ['server minimum payable enforcement', 'minPayableAmount'],
  ['server coupon usage limit', 'assertPromoUsageAllowed'],
  ['coupon total usage has no implicit cap', 'DEFAULT_PROMO_TOTAL_USAGE_LIMIT'],
  ['reward coupon tier redemption respects tier enable switch', 'Admin မှ Reward Coupon Tier အသစ်လဲလှယ်ခွင့်ကို ယာယီပိတ်ထားပါသည်။'],
  ['checkout coupon code format validation', 'Coupon Code မမှန်ကန်ပါ။'],
  ['coupon total usage limit defaults server-side', 'body.coupon?.totalUsageLimit ?? DEFAULT_PROMO_TOTAL_USAGE_LIMIT'],
  ['corrupt usage counter fails closed', 'return Number.isFinite(number) && number >= 0 ? Math.min(1000000000, Math.floor(number)) : 1000000000;'],
  ['order line total finite validation', 'if (!Number.isFinite(lineTotal) || lineTotal < 0 || lineTotal > 1000000000000)'],
  ['server discount stacking policy', 'assertStackingAllowed'],
  ['server total discount cap', 'totalDiscountCap'],
  ['combined discount validation', 'assertTotalDiscountWithinCap'],
  ['server financial audit trail', 'financial_audit_logs'],
  ['transactional coupon usage counter', 'promo_coupon_usage'],
  ['per-customer legacy coupon usage migration', 'ensurePromoUserUsage'],
  ['per-coupon total counter collection', 'promo_coupon_counters'],
  ['active coupon counter UI listener scope', ".where('active', '==', true)"],
  ['atomic total coupon counter update', 'tx.set(promoCounterRef'],
  ['atomic per-customer coupon counter update', 'tx.set(promoUsageRef'],
  ['coupon order reservation idempotency', 'promoUsageOrderIds.includes(normalizedId)'],
  ['coupon usage restore on cancel/refund', 'restorePromoCouponUsageInTransaction'],
  ['purchase reward idempotency marker read', 'tx.get(rewardMarkerRef)'],
  ['purchase reward idempotency marker create', 'tx.create(rewardMarkerRef'],
  ['coupon redeem idempotency read', 'tx.get(idempotencyRef)'],
  ['reward settings cap validation', 'validateRewardCaps({ ...sanitized, ...settings })'],
  ['review reward idempotency claim', 'tx.create(rewardClaimRef, {'], ['pending order cancellation restore', 'admin_cancel_pending_order'],
  ['coupon validation master switch', 'rewardCouponsEnabled === false'], ['private product cost collection', 'product_costs'],
  ['ImageKit server upload proxy', '/api/imagekit-upload']
];
for (const [label, needle] of required) {
  const hay = label.includes('UI') || label.includes('conversion') || label.includes('proxy') ? html : label.includes('private') ? store : store;
  if (!hay.includes(needle)) throw new Error(`Missing required safeguard: ${label}`);
}
if (html.includes('cfgMaxCashbackRewardPerTier') || html.includes('cfgMaxCashbackRewardPerOrder')) throw new Error('Retired cashback cap controls must not appear in Admin UI');
if (!store.includes('Cashback caps have been retired')) throw new Error('Cashback caps must remain disabled in server award path');
if (!rules.includes('match /product_costs/{productId}')) throw new Error('Private product cost Firestore rule missing');
if (!rules.includes('match /financial_audit_logs/{logId}')) throw new Error('Financial audit log Firestore rule missing');
if (!rules.includes('match /promo_coupon_counters/{counterId}')) throw new Error('Admin-only promo coupon counter rule missing');
if (!rules.includes('match /promo_coupon_usage/{usageId} { allow read, write: if false; }')) throw new Error('Private promo coupon usage rule missing');
if (!rules.includes('match /financial_audit_logs/{logId} { allow read: if isAdmin(); allow write: if false; }')) throw new Error('Financial audit logs must be admin-read-only');
if (!rules.includes('match /promo_coupon_counters/{counterId} { allow read: if isAdmin(); allow write: if false; }')) throw new Error('Coupon counters must be admin-read-only');
if (firebase.storage?.rules !== 'storage.rules') throw new Error('Firebase Storage rules are not wired in firebase.json');
if (!html.includes('ddfashion-36025.firebaseapp.com')) throw new Error('Production Firebase project config missing');
if (html.includes('dd-test-90c45.firebaseapp.com')) throw new Error('Testing Firebase project config must not be in Production ZIP');
if (html.includes('IMAGEKIT_PRIVATE_KEY')) throw new Error('ImageKit private key name/value must never appear in frontend source');
if (fs.existsSync(path.join(root, '_legacy_netlify_functions'))) throw new Error('Obsolete duplicate Netlify function folder must be removed');
cp.execFileSync(process.execPath, [path.join(root,'scripts/financial-safety-test.js')]);
cp.execFileSync(process.execPath, [path.join(root,'scripts/checkout-safety-test.js')]);
console.log(`Smoke tests passed (${files.length} source files syntax-checked, ${inlineScripts.length} inline scripts parsed, ${required.length} feature guards verified).`);
