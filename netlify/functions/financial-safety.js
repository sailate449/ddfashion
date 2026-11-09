'use strict';

const DEFAULT_PROMO_TOTAL_USAGE_LIMIT = 0; // Admin may set a total cap; 0 means unlimited.

const DEFAULT_FINANCIAL_SAFETY = Object.freeze({
  maxTotalDiscountPercent: 50,
  maxTotalDiscountAmount: 0,
  maxCashbackUsePercent: 50,
  allowCouponWithPoints: false,
  allowCouponWithCashback: false,
  allowPointsWithCashback: false,
  maxCashbackRewardPerTier: 50000,
  maxCashbackRewardPerOrder: 100000,
  maxReviewPointsPerReview: 1000
});

function finiteWhole(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function normalizeFinancialSafety(input = {}) {
  const source = input || {};
  return {
    maxTotalDiscountPercent: Math.min(90, Math.max(1, finiteWhole(source.maxTotalDiscountPercent, DEFAULT_FINANCIAL_SAFETY.maxTotalDiscountPercent))),
    maxTotalDiscountAmount: Math.min(1000000000, Math.max(0, finiteWhole(source.maxTotalDiscountAmount, DEFAULT_FINANCIAL_SAFETY.maxTotalDiscountAmount))),
    maxCashbackUsePercent: Math.min(100, Math.max(1, finiteWhole(source.maxCashbackUsePercent, DEFAULT_FINANCIAL_SAFETY.maxCashbackUsePercent))),
    allowCouponWithPoints: source.allowCouponWithPoints === true,
    allowCouponWithCashback: source.allowCouponWithCashback === true,
    allowPointsWithCashback: source.allowPointsWithCashback === true,
    // Cashback tier/order caps are intentionally retired. Admin-defined
    // Monthly and Lifetime reward values are paid as configured.
    maxCashbackRewardPerTier: 100000000,
    maxCashbackRewardPerOrder: 100000000,
    maxReviewPointsPerReview: Math.min(1000000, Math.max(1, finiteWhole(source.maxReviewPointsPerReview, DEFAULT_FINANCIAL_SAFETY.maxReviewPointsPerReview)))
  };
}

function totalDiscountCap(subtotal, settings) {
  const s = normalizeFinancialSafety(settings);
  const byPercent = Math.floor(Math.max(0, Number(subtotal) || 0) * s.maxTotalDiscountPercent / 100);
  return s.maxTotalDiscountAmount > 0 ? Math.min(byPercent, s.maxTotalDiscountAmount) : byPercent;
}

function cashbackUseCap(remainingBeforeCashback, rawSubtotal, discountsAlreadyUsed, minPayable, settings) {
  const remaining = Number(remainingBeforeCashback);
  const subtotal = Number(rawSubtotal);
  const used = Number(discountsAlreadyUsed);
  const minimum = Number(minPayable);
  if (![remaining, subtotal, used, minimum].every(Number.isFinite) || remaining < 0 || subtotal < 0 || used < 0 || minimum < 0) {
    throw new Error('Cashback အသုံးပြုခွင့် ကန့်သတ်ချက်တွက်ချက်မှု မမှန်ကန်ပါ။');
  }
  const s = normalizeFinancialSafety(settings);
  const percentCap = Math.floor(remaining * s.maxCashbackUsePercent / 100);
  const payableCap = Math.max(0, remaining - minimum);
  const globalDiscountCap = Math.max(0, totalDiscountCap(subtotal, s) - used);
  return Math.max(0, Math.min(percentCap, payableCap, globalDiscountCap));
}

function assertTotalDiscountWithinCap(subtotal, discountAmounts, settings) {
  const baseSubtotal = Number(subtotal);
  if (!Number.isFinite(baseSubtotal) || baseSubtotal < 0) throw new Error('Order စုစုပေါင်းတန်ဖိုး မမှန်ကန်ပါ။');
  const values = Array.isArray(discountAmounts) ? discountAmounts : [discountAmounts];
  let total = 0;
  for (const amount of values) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) throw new Error('Discount ပမာဏ မမှန်ကန်ပါ။');
    total += value;
    if (!Number.isFinite(total)) throw new Error('စုစုပေါင်း Discount ပမာဏ မမှန်ကန်ပါ။');
  }
  const cap = totalDiscountCap(baseSubtotal, settings);
  if (total > cap) throw new Error(`စုစုပေါင်း Discount အများဆုံး ${cap.toLocaleString()} Ks သာ ခွင့်ပြုထားပါသည်။ လက်ရှိ ${total.toLocaleString()} Ks ဖြစ်နေပါသည်။`);
  return { total, cap };
}

function assertStackingAllowed({ coupon = false, points = false, cashback = false }, settings) {
  const s = normalizeFinancialSafety(settings);
  if (coupon && points && !s.allowCouponWithPoints) throw new Error('Admin သတ်မှတ်ချက်အရ Coupon နှင့် Points ကို တစ်ခါတည်း အသုံးမပြုနိုင်ပါ။');
  if (coupon && cashback && !s.allowCouponWithCashback) throw new Error('Admin သတ်မှတ်ချက်အရ Coupon နှင့် Cashback ကို တစ်ခါတည်း အသုံးမပြုနိုင်ပါ။');
  if (points && cashback && !s.allowPointsWithCashback) throw new Error('Admin သတ်မှတ်ချက်အရ Points နှင့် Cashback ကို တစ်ခါတည်း အသုံးမပြုနိုင်ပါ။');
}

function getPromoUsageLimits(promo = {}) {
  const rawTotal = promo.totalUsageLimit;
  const parsedTotal = Number(rawTotal);
  const total = rawTotal === undefined || rawTotal === null || rawTotal === ''
    ? DEFAULT_PROMO_TOTAL_USAGE_LIMIT
    : (Number.isFinite(parsedTotal) && parsedTotal >= 0 ? Math.floor(parsedTotal) : 1);
  const perUser = finiteWhole(promo.perUserUsageLimit, 1);
  return {
    total: Math.max(0, Math.min(10000000, total)),
    perUser: Math.max(1, Math.min(1000, perUser))
  };
}

function assertPromoUsageAllowed(promo, totalUsed, userUsed) {
  const limits = getPromoUsageLimits(promo);
  const safeCount = value => {
    if (value === undefined || value === null || value === '') return 0;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : Number.MAX_SAFE_INTEGER;
  };
  if (limits.total > 0 && safeCount(totalUsed) >= limits.total) throw new Error('ဤ Promotion Coupon ၏ စုစုပေါင်းအသုံးပြုခွင့် ပြည့်သွားပါပြီ။');
  if (safeCount(userUsed) >= limits.perUser) throw new Error(`ဤ Coupon ကို Customer တစ်ဦးလျှင် ${limits.perUser} ကြိမ်သာ အသုံးပြုနိုင်ပါသည်။`);
  return limits;
}

function evaluateCashbackTierCaps(lifetimeTiers, monthlyTiers, settings) {
  // Cashback safety caps have been retired so valid Admin-defined Monthly and
  // Lifetime rewards cannot be silently blocked. Discount/review safeguards remain.
  const lifetime = Array.isArray(lifetimeTiers) ? lifetimeTiers : [];
  const monthly = Array.isArray(monthlyTiers) ? monthlyTiers : [];
  const cashbackTiers = [...lifetime.filter(t => t.rewardType === 'cashback'), ...monthly];
  const attemptedAmount = cashbackTiers.reduce((sum, tier) => sum + Math.max(0, Number(tier.rewardValue) || 0), 0);
  return {
    blocked: false,
    attemptedAmount,
    lifetimeTiers: lifetime,
    monthlyTiers: monthly,
    blockedTierIds: []
  };
}

function validateRewardCaps(settings) {
  const s = normalizeFinancialSafety(settings);
  const review4 = finiteWhole(settings.points4Star, 0);
  const review5 = finiteWhole(settings.points5Star, 0);
  const photo = finiteWhole(settings.photoBonusPoints, 0);
  if (review4 < 0 || review5 < 0 || photo < 0 || review4 + photo > s.maxReviewPointsPerReview || review5 + photo > s.maxReviewPointsPerReview) {
    throw new Error(`Review Points သည် Review တစ်ခုလျှင် ${s.maxReviewPointsPerReview.toLocaleString()} Pts ထက် မပိုရပါ။`);
  }
  const lifetime = Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers : [];
  const monthly = Array.isArray(settings.monthlyPurchaseTiers) ? settings.monthlyPurchaseTiers : [];
  const all = [...lifetime, ...monthly];
  let cashbackTotal = 0;
  for (const tier of all) {
    const threshold = finiteWhole(tier.threshold, 0);
    const value = Number(tier.rewardValue);
    if (!String(tier.id || '').trim() || threshold < 1 || !Number.isFinite(value) || value < 0) throw new Error('Purchase Reward Tier အချက်အလက် မမှန်ကန်ပါ။');
    // Lifetime and Monthly purchase tiers are Cashback-only.
    cashbackTotal += finiteWhole(value);
  }
  // No combined Cashback cap: Monthly and Lifetime rewards can both be paid.
  return s;
}

module.exports = {
  DEFAULT_FINANCIAL_SAFETY,
  DEFAULT_PROMO_TOTAL_USAGE_LIMIT,
  normalizeFinancialSafety,
  totalDiscountCap,
  cashbackUseCap,
  assertTotalDiscountWithinCap,
  assertStackingAllowed,
  getPromoUsageLimits,
  assertPromoUsageAllowed,
  evaluateCashbackTierCaps,
  validateRewardCaps
};
