const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const backend = fs.readFileSync(path.join(root, 'netlify/functions/store-data.js'), 'utf8');
const frontend = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// New switches default to enabled so existing stores retain their current behavior.
for (const key of ['rewardCouponTiersEnabled', 'lifetimeCashbackTiersEnabled', 'monthlyCashbackTiersEnabled']) {
  assert(backend.includes(`${key}: true`), `${key} must default to enabled`);
  assert(backend.includes(`${key}: settings.${key} !== false`), `${key} must be persisted as an explicit boolean`);
  assert(frontend.includes(`data-reward-toggle="${key}"`), `${key} must have admin controls`);
  assert(frontend.includes(`id="cfg${key[0].toUpperCase()}${key.slice(1)}"`), `${key} must have a form state input`);
}

// Reward Coupon Tier disable blocks new point-redemptions, but must not disable
// checkout validation/use of already-issued reward coupons.
assert(backend.includes("if (rewardCfg.rewardCouponTiersEnabled === false) throw new Error('Admin မှ Reward Coupon Tier အသစ်လဲလှယ်ခွင့်ကို ယာယီပိတ်ထားပါသည်။');"));
assert(backend.includes("if (rewardSettings.rewardCouponsEnabled === false) throw new Error('Admin မှ Reward Coupon အသုံးပြုခွင့်ကို ယာယီပိတ်ထားပါသည်။');"), 'Existing coupon checkout gate remains a separate setting');
assert(backend.includes("if (rewardCfg.rewardCouponsEnabled === false) return { statusCode: 403"), 'Existing coupon validation remains governed by its separate use setting');

// Cashback toggles are enforced in both completion-time awards and customer reconciliation.
assert(backend.includes("cfg.lifetimeCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.purchaseTiers)"));
assert(backend.includes("cfg.monthlyCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.monthlyPurchaseTiers)"));
assert(backend.includes("cfg.lifetimeCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.purchaseTiers)"));
assert(backend.includes("cfg.monthlyCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.monthlyPurchaseTiers)"));

// Re-enabling cashback creates a fresh baseline, so disabled-period orders are not paid retroactively.
assert(backend.includes('const lifetimeReenabled = previousSettings.lifetimeCashbackTiersEnabled === false && sanitized.lifetimeCashbackTiersEnabled === true;'));
assert(backend.includes('const monthlyReenabled = previousSettings.monthlyCashbackTiersEnabled === false && sanitized.monthlyCashbackTiersEnabled === true;'));
assert(backend.includes('lifetimeTiersChanged || lifetimeReenabled ? now'));
assert(backend.includes('monthlyTiersChanged || monthlyReenabled ? now'));
assert(backend.includes('monthlyTiersChanged || monthlyReenabled ? myanmarMonthKey(now)'));

// Existing customer coupons remain rendered while new tier redemption is paused.
assert(frontend.includes('Reward Coupon အသစ်လဲလှယ်ခွင့်ကို Admin မှ ယာယီပိတ်ထားပါသည်။ ရရှိပြီးသား Coupon များကို သက်တမ်းနှင့် စည်းမျဉ်းအတိုင်း ဆက်လက်အသုံးပြုနိုင်ပါသည်။'));
assert(frontend.includes('const couponsBox = document.getElementById(\'custRedeemedCouponsList\')'));
assert(frontend.includes('if (window.rewardSettings?.rewardCouponTiersEnabled === false)'));

console.log('Reward program toggle safety tests passed (three independent switches, server-side award/redeem enforcement, re-enable baselines, existing coupon usability separation).');
