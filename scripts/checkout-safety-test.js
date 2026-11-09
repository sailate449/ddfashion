'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('window.getCheckoutTotalDiscountCap = (rawTotal) => {');
const end = html.indexOf('window.getCheckoutCashbackRewardEstimate = () => {', start);
if (start < 0 || end < 0) throw new Error('Checkout financial safety helpers were not found.');
const snippet = html.slice(start, end);

function setup({ settings = {}, couponDiscount = 0, points = '0', cashback = '0', subtotal = 100000, pointsBalance = 100000, cashbackBalance = 100000 } = {}) {
  const inputs = {
    coPointsUseInput: { value: points },
    coCashbackUseInput: { value: cashback }
  };
  const window = { rewardSettings: { minPayableAmount: 1000, pointsPer1000Ks: 100, maxTotalDiscountPercent: 50, checkoutPointsEnabled: true, ...settings } };
  const context = {
    window,
    document: { getElementById: id => inputs[id] || null },
    currentUser: { uid: 'customer_test', pointsBalance, cashbackBalance },
    cart: [{ id: 'p1', price: subtotal, qty: 1 }],
    activeCoupon: couponDiscount > 0 ? { code: 'TEST10' } : null,
    calculateCartCouponDiscount: () => ({ discount: couponDiscount }),
    Math, Number, String, Boolean
  };
  vm.runInNewContext(snippet, context);
  return { window, inputs, context };
}

// A 50% combined cap includes coupon, points and cashback together.
{
  const { window } = setup({
    settings: { allowCouponWithPoints: true, allowCouponWithCashback: true, allowPointsWithCashback: true },
    couponDiscount: 10000, points: '1000', cashback: '100000'
  });
  const points = window.getCheckoutPointsRedemption();
  const cashback = window.getCheckoutCashbackAmount();
  assert.strictEqual(points.discount, 10000);
  assert.strictEqual(cashback, 30000);
  assert.strictEqual(10000 + points.discount + cashback, 50000);
}


// Cashback has its own Admin-configured per-order percentage cap (default 50%).
{
  const { window } = setup({ cashback: '100000', subtotal: 100000, settings: { maxCashbackUsePercent: 30 } });
  assert.strictEqual(window.getCheckoutCashbackAmount(), 30000);
}

// The per-order Cashback percentage cap is applied after coupon/points and cannot exceed remaining payable.
{
  const { window } = setup({
    cashback: '100000', subtotal: 100000,
    settings: { maxTotalDiscountPercent: 90, maxCashbackUsePercent: 40, allowCouponWithCashback: true },
    couponDiscount: 10000
  });
  assert.strictEqual(window.getCheckoutCashbackAmount(), 36000);
}

// Coupon + Points disabled: the client preview does not apply points.
{
  const { window } = setup({ settings: { allowCouponWithPoints: false }, couponDiscount: 10000, points: '1000' });
  assert.strictEqual(window.getCheckoutPointsRedemption().discount, 0);
}

// Coupon + Cashback disabled: the client preview does not apply cashback.
{
  const { window } = setup({ settings: { allowCouponWithCashback: false }, couponDiscount: 10000, cashback: '5000' });
  assert.strictEqual(window.getCheckoutCashbackAmount(), 0);
}

// Points + Cashback disabled: entering both prioritizes the explicitly entered Cashback, not both.
{
  const { window } = setup({ settings: { allowPointsWithCashback: false }, points: '1000', cashback: '5000' });
  assert.strictEqual(window.getCheckoutPointsRedemption().discount, 0);
  assert.strictEqual(window.getCheckoutCashbackAmount(), 5000);
}

// Absolute discount amount cap is respected by the combined preview.
{
  const { window } = setup({
    settings: { maxTotalDiscountPercent: 90, maxTotalDiscountAmount: 15000, allowCouponWithPoints: true },
    couponDiscount: 10000, points: '1000'
  });
  assert.strictEqual(window.getCheckoutPointsRedemption().discount, 5000);
}

console.log('Checkout safety UI tests passed (stacking policy and combined discount caps).');
