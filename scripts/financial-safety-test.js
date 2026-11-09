'use strict';
const assert = require('assert');
const {
  DEFAULT_PROMO_TOTAL_USAGE_LIMIT, normalizeFinancialSafety, totalDiscountCap, cashbackUseCap, assertTotalDiscountWithinCap, assertStackingAllowed,
  getPromoUsageLimits, assertPromoUsageAllowed, evaluateCashbackTierCaps, validateRewardCaps
} = require('../netlify/functions/financial-safety');

const defaults = normalizeFinancialSafety({});
assert.strictEqual(defaults.maxTotalDiscountPercent, 50);
assert.strictEqual(defaults.maxCashbackUsePercent, 50);
assert.strictEqual(normalizeFinancialSafety({ maxCashbackUsePercent: 125 }).maxCashbackUsePercent, 100);
assert.strictEqual(normalizeFinancialSafety({ maxCashbackUsePercent: 0 }).maxCashbackUsePercent, 1);
assert.strictEqual(totalDiscountCap(100000, defaults), 50000);
assert.strictEqual(cashbackUseCap(100000, 100000, 0, 1000, defaults), 50000);
assert.strictEqual(cashbackUseCap(80000, 100000, 20000, 1000, { ...defaults, maxTotalDiscountPercent: 90, maxCashbackUsePercent: 40 }), 32000);
assert.strictEqual(cashbackUseCap(10000, 10000, 0, 1000, { ...defaults, maxTotalDiscountPercent: 90, maxCashbackUsePercent: 100 }), 9000);
assert.strictEqual(totalDiscountCap(100000, { ...defaults, maxTotalDiscountPercent: 70, maxTotalDiscountAmount: 25000 }), 25000);
assert.deepStrictEqual(assertTotalDiscountWithinCap(100000, [20000, 10000, 10000], defaults), { total: 40000, cap: 50000 });
assert.throws(() => assertTotalDiscountWithinCap(100000, [30000, 10000, 10001], defaults), /စုစုပေါင်း Discount အများဆုံး/);
assert.throws(() => assertTotalDiscountWithinCap(100000, [1000, Infinity], defaults), /Discount ပမာဏ မမှန်ကန်/);
assert.throws(() => assertTotalDiscountWithinCap(Infinity, [0], defaults), /Order စုစုပေါင်းတန်ဖိုး မမှန်ကန်/);

assert.throws(() => assertStackingAllowed({ coupon: true, points: true }, defaults), /Coupon နှင့် Points/);
assert.throws(() => assertStackingAllowed({ coupon: true, cashback: true }, defaults), /Coupon နှင့် Cashback/);
assert.throws(() => assertStackingAllowed({ points: true, cashback: true }, defaults), /Points နှင့် Cashback/);
assert.doesNotThrow(() => assertStackingAllowed({ coupon: true, points: true, cashback: false }, { ...defaults, allowCouponWithPoints: true }));

assert.strictEqual(DEFAULT_PROMO_TOTAL_USAGE_LIMIT, 0);
assert.deepStrictEqual(getPromoUsageLimits({}), { total: 0, perUser: 1 });
assert.doesNotThrow(() => assertPromoUsageAllowed({}, 999999, 0));
assert.doesNotThrow(() => assertPromoUsageAllowed({}, 1000000, 0));
assert.doesNotThrow(() => assertPromoUsageAllowed({}, Infinity, 0));
assert.throws(() => assertPromoUsageAllowed({ totalUsageLimit: -1 }, 1000, 0), /စုစုပေါင်းအသုံးပြုခွင့် ပြည့်/);
assert.deepStrictEqual(getPromoUsageLimits({ totalUsageLimit: 0 }), { total: 0, perUser: 1 });

const promo = { totalUsageLimit: 10, perUserUsageLimit: 2 };
assert.deepStrictEqual(assertPromoUsageAllowed(promo, 9, 1), { total: 10, perUser: 2 });
assert.throws(() => assertPromoUsageAllowed(promo, 10, 0), /စုစုပေါင်းအသုံးပြုခွင့် ပြည့်/);
assert.throws(() => assertPromoUsageAllowed(promo, 2, 2), /Customer တစ်ဦးလျှင် 2 ကြိမ်/);
assert.doesNotThrow(() => assertPromoUsageAllowed({ totalUsageLimit: 0, perUserUsageLimit: 1 }, 999999, 0));
assert.deepStrictEqual(getPromoUsageLimits({ perUserUsageLimit: 50000 }), { total: 0, perUser: 1000 });
assert.throws(() => assertPromoUsageAllowed({ perUserUsageLimit: 50000 }, 0, 1000), /Customer တစ်ဦးလျှင် 1000 ကြိမ်/);

const safeRewards = {
  points4Star: 10, points5Star: 20, photoBonusPoints: 5,
  maxReviewPointsPerReview: 1000, maxCashbackRewardPerTier: 50000,
  maxCashbackRewardPerOrder: 100000,
  purchaseTiers: [
    { id: 'life1', threshold: 100000, rewardType: 'cashback', rewardValue: 10000 },
    { id: 'life2', threshold: 200000, rewardType: 'discount', rewardValue: 10 }
  ],
  monthlyPurchaseTiers: [{ id: 'month1', threshold: 100000, rewardType: 'cashback', rewardValue: 5000 }]
};
assert.doesNotThrow(() => validateRewardCaps(safeRewards));
const cashbackAllowed = evaluateCashbackTierCaps([{ id: 'life', rewardType: 'cashback', rewardValue: 10000 }, { id: 'discount', rewardType: 'discount', rewardValue: 10 }], [{ id: 'month', rewardValue: 5000 }], defaults);
assert.strictEqual(cashbackAllowed.blocked, false);
assert.deepStrictEqual(cashbackAllowed.lifetimeTiers.map(t => t.id), ['life', 'discount']);
const cashbackUnlimited = evaluateCashbackTierCaps(
  [{ id: 'life', rewardType: 'cashback', rewardValue: 60000 }, { id: 'discount', rewardType: 'discount', rewardValue: 10 }],
  [{ id: 'month', rewardValue: 300000 }], defaults
);
assert.strictEqual(cashbackUnlimited.blocked, false);
assert.deepStrictEqual(cashbackUnlimited.lifetimeTiers.map(t => t.id), ['life', 'discount']);
assert.deepStrictEqual(cashbackUnlimited.monthlyTiers.map(t => t.id), ['month']);
assert.deepStrictEqual(cashbackUnlimited.blockedTierIds, []);
assert.throws(() => validateRewardCaps({ ...safeRewards, points5Star: 999, photoBonusPoints: 10 }), /Review တစ်ခုလျှင်/);
assert.throws(() => validateRewardCaps({ ...safeRewards, points4Star: 999, photoBonusPoints: 10 }), /Review တစ်ခုလျှင်/);
assert.doesNotThrow(() => validateRewardCaps({ ...safeRewards, purchaseTiers: [{ id: 'huge', threshold: 700000, rewardType: 'cashback', rewardValue: 60000 }], monthlyPurchaseTiers: [{ id: 'month', threshold: 500000, rewardValue: 300000 }] }));

console.log('Financial safety unit tests passed (discount caps, stacking, coupon limits, uncapped Admin cashback tiers, review-point cap).');
