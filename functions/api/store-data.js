import {
  DEFAULT_FINANCIAL_SAFETY, DEFAULT_PROMO_TOTAL_USAGE_LIMIT, normalizeFinancialSafety, totalDiscountCap, cashbackUseCap, assertTotalDiscountWithinCap, assertStackingAllowed, assertPromoUsageAllowed, getPromoUsageLimits, validateRewardCaps
} from './_financial-safety.js';

import {
  JSON_HEADERS,
  normalizeEmail,
  createAdminCompat,
  cryptoCompat as crypto,
  BufferCompat as Buffer
} from './_cf-adapter.js';

let currentEnv = {};
let admin = null;
const process = { get env() { return currentEnv; } };
function initFirebaseAdmin() {
  admin = createAdminCompat(currentEnv);
  return admin;
}
function resolveServerRole(email) {
  return createAdminCompat(currentEnv).resolveServerRole(email);
}
const exports = {};

const DEFAULT_REWARD_SETTINGS = {
  // Reward amounts and purchase tiers are Admin-only. Missing configuration
  // must never grant points, cashback, discounts, or purchase rewards.
  points4Star: 0,
  points5Star: 0,
  photoBonusPoints: 0,
  couponValidityDays: 0,
  rewardCouponsEnabled: true,
  rewardCouponTiersEnabled: true,
  lifetimeCashbackTiersEnabled: true,
  monthlyCashbackTiersEnabled: true,
  minPayableAmount: 1000,
  checkoutPointsEnabled: false,
  pointsPer1000Ks: 100,
  reverseReviewPointsOnRefund: true,
  keepReviewAfterRefund: true,
  ...DEFAULT_FINANCIAL_SAFETY,
  purchaseTiers: [],
  monthlyPurchaseTiers: [],
  tiers: []
};

const LEGACY_AUTO_PURCHASE_TIER_IDS = new Set(['spend_200k', 'spend_500k', 'spend_1m']);
function getRewardSettings(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const settings = { ...DEFAULT_REWARD_SETTINGS, ...source };
  settings.purchaseTiers = (Array.isArray(source.purchaseTiers) ? source.purchaseTiers : [])
    .filter(tier => !LEGACY_AUTO_PURCHASE_TIER_IDS.has(String(tier?.id || '')) && tier?.rewardType === 'cashback');
  settings.monthlyPurchaseTiers = Array.isArray(source.monthlyPurchaseTiers) ? source.monthlyPurchaseTiers : [];
  // Older builds persisted these built-in review values without Admin input.
  // Require the new config version to treat those exact legacy values as intentional.
  if (Number(source.adminConfigVersion || 0) < 2) {
    if (Number(source.points4Star) === 10) settings.points4Star = 0;
    if (Number(source.points5Star) === 20) settings.points5Star = 0;
    if (Number(source.photoBonusPoints) === 5) settings.photoBonusPoints = 0;
  }
  return settings;
}


function isComingSoonOnlyProduct(product) {
  if (!product || typeof product !== 'object') return false;
  const section = String(product.displaySection || '').trim().toLowerCase();
  if (section === 'coming_soon') return true;
  if (section === 'shop' || section === 'both') return false;
  return product.comingSoon === true && product.showInShop !== true;
}

function isPyinOoLwinCity(value) {
  const compact = String(value || '').normalize('NFC').toLowerCase().replace(/[\s.,()\-_/]+/g, '');
  const aliases = ['pol', 'pyinoolwin', 'pyinoolwinn', 'pyinoowlwin', 'pyinoowin', 'ပြင်ဦးလွင်', 'ပြင်ဦးလင်', 'မေမြို့', 'မေမြို့မြို့'];
  return aliases.some(alias => compact.includes(alias));
}

// Legacy orders may use a boolean refunded flag instead of refundedAt/refundReason.
// Treat every known refund marker as disqualifying for review rewards.
function isOrderRefunded(order = {}) {
  const status = String(order.status || '').trim().toLowerCase();
  const refundStatus = String(order.refundStatus || order.refund_state || '').trim().toLowerCase();
  const paymentStatus = String(order.paymentStatus || '').trim().toLowerCase();
  return status === 'refunded' || refundStatus === 'refunded' || paymentStatus === 'refunded' ||
    order.refunded === true || order.refundCompleted === true || Boolean(order.refundedAt) || Boolean(order.refundReason);
}

function myanmarMonthKey(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yangon', year: 'numeric', month: '2-digit' }).formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value || '';
  const month = parts.find(part => part.type === 'month')?.value || '';
  return `${year}-${month}`;
}

function safeFinancialCount(value) {
  if (value === undefined || value === null || value === '') return 0;
  const number = Number(value);
  // Fail closed on corrupted counters; a bad counter must never reopen a coupon.
  return Number.isFinite(number) && number >= 0 ? Math.min(1000000000, Math.floor(number)) : 1000000000;
}

function isTrustedImageKitUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && (parsed.hostname === 'ik.imagekit.io' || parsed.hostname.endsWith('.imagekit.io'));
  } catch (_) { return false; }
}

function isCustomerReviewImageUrl(value, uid, productId) {
  if (!isTrustedImageKitUrl(value) || !uid || !productId) return false;
  try {
    const parsed = new URL(value);
    const segments = decodeURIComponent(parsed.pathname).split('/').filter(Boolean);
    const reviewIndex = segments.indexOf('reviews');
    return reviewIndex >= 0 && segments[reviewIndex + 1] === String(uid) && segments[reviewIndex + 2] === String(productId);
  } catch (_) { return false; }
}

async function verifyImageKitPhotoUrl(value, uid, productId) {
  if (!isCustomerReviewImageUrl(value, uid, productId)) return false;
  try {
    const response = await fetch(value, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    return response.ok && contentType.startsWith('image/');
  } catch (_) { return false; }
}

async function verifyCustomerToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!idToken) {
    throw new Error('Authentication required. Please log in first.');
  }
  initFirebaseAdmin();
  const auth = admin.auth();
  const db = admin.firestore();
  const decoded = await auth.verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: normalizeEmail(decoded.email || ''),
    name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Customer'),
    db
  };
}

async function verifyAdminRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!idToken) {
    throw new Error('Missing Firebase ID token for Admin action.');
  }

  initFirebaseAdmin();
  const auth = admin.auth();
  const db = admin.firestore();

  const decoded = await auth.verifyIdToken(idToken);
  const email = normalizeEmail(decoded.email);
  // Single source of truth: server-managed Firestore user profile. The role is
  // refreshed by user-session from the deployment allowlist; neither old token
  // claims nor a second hard-coded allowlist authorizes an Admin API call.
  const userSnap = await db.collection('users').doc(decoded.uid).get();
  const profileRole = userSnap.exists ? String((userSnap.data() || {}).role || '') : '';
  const effectiveRole = ['admin_master', 'admin_staff'].includes(profileRole) ? profileRole : 'customer';

  if (effectiveRole !== 'admin_master' && effectiveRole !== 'admin_staff') {
    throw new Error('Unauthorized: Admin or Staff privileges required.');
  }

  return { uid: decoded.uid, email, role: effectiveRole, db };
}

async function ensurePromoCouponCounter(db, code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const counterRef = db.collection('promo_coupon_counters').doc(normalizedCode);
  const currentSnap = await counterRef.get();
  if (currentSnap.exists) {
    const current = currentSnap.data() || {};
    if (current.active !== true) await counterRef.set({ code: normalizedCode, active: true, updatedAt: Date.now() }, { merge: true });
    return { ref: counterRef, usageCount: safeFinancialCount(current.usageCount) };
  }
  const legacyOrders = await db.collection('orders').where('couponCode', '==', normalizedCode).get();
  const legacyUsageCount = legacyOrders.docs.reduce((count, orderDoc) => {
    const oldOrder = orderDoc.data() || {};
    const status = String(oldOrder.status || '').toLowerCase();
    return status === 'cancelled' || status === 'canceled' || status === 'refunded' || oldOrder.refundedAt || oldOrder.refundReason ? count : count + 1;
  }, 0);
  const usageCount = await db.runTransaction(async tx => {
    const freshSnap = await tx.get(counterRef);
    if (freshSnap.exists) return safeFinancialCount((freshSnap.data() || {}).usageCount);
    tx.create(counterRef, { code: normalizedCode, active: true, usageCount: legacyUsageCount, migratedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() });
    return legacyUsageCount;
  });
  return { ref: counterRef, usageCount };
}

async function ensurePromoUserUsage(db, code, userId) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const usageRef = db.collection('promo_coupon_usage').doc(crypto.createHash('sha256').update(`${normalizedCode}:${userId}`).digest('hex'));
  const currentSnap = await usageRef.get();
  if (currentSnap.exists) {
    const current = currentSnap.data() || {};
    return { ref: usageRef, usageCount: safeFinancialCount(current.usageCount), orderIds: Array.isArray(current.orderIds) ? current.orderIds.map(String) : [] };
  }
  const priorOrders = await db.collection('orders').where('userId', '==', userId).get();
  const orderIds = priorOrders.docs.filter(orderDoc => {
    const oldOrder = orderDoc.data() || {};
    const status = String(oldOrder.status || '').toLowerCase();
    return String(oldOrder.couponCode || '').trim().toUpperCase() === normalizedCode && !['cancelled', 'canceled', 'refunded'].includes(status) && !oldOrder.refundedAt && !oldOrder.refundReason;
  }).map(orderDoc => orderDoc.id).slice(-10000);
  const usageCount = await db.runTransaction(async tx => {
    const freshSnap = await tx.get(usageRef);
    if (freshSnap.exists) return safeFinancialCount((freshSnap.data() || {}).usageCount);
    tx.create(usageRef, { code: normalizedCode, userId, usageCount: orderIds.length, orderIds, migratedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() });
    return orderIds.length;
  });
  const finalSnap = await usageRef.get();
  const finalData = finalSnap.exists ? finalSnap.data() || {} : {};
  return { ref: usageRef, usageCount, orderIds: Array.isArray(finalData.orderIds) ? finalData.orderIds.map(String) : orderIds };
}

function restorePromoCouponUsageInTransaction(tx, db, code, userId, orderId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef) {
  if (!code || !promoCounterSnap || !promoCounterSnap.exists) return false;
  const counter = promoCounterSnap.data() || {};
  const nextTotalUsage = Math.max(0, safeFinancialCount(counter.usageCount) - 1);
  let nextUserUsage = null;
  if (promoUsageSnap && promoUsageSnap.exists) {
    const usage = promoUsageSnap.data() || {};
    const orderIds = Array.isArray(usage.orderIds) ? usage.orderIds.map(String) : [];
    if (!orderIds.includes(String(orderId))) return false;
    const remainingOrderIds = orderIds.filter(id => id !== String(orderId));
    nextUserUsage = Math.max(0, safeFinancialCount(usage.usageCount) - 1);
    tx.set(promoUsageRef, {
      usageCount: nextUserUsage, orderIds: remainingOrderIds,
      lastOrderId: remainingOrderIds.length ? remainingOrderIds[remainingOrderIds.length - 1] : null,
      lastUsageRestoredAt: Date.now()
    }, { merge: true });
  }
  // Older orders may predate the per-customer usage marker. Restore their
  // global counter; their per-customer legacy count is recalculated from active orders.
  tx.set(promoCounterRef, { code: String(code).trim().toUpperCase(), usageCount: nextTotalUsage, updatedAt: Date.now(), lastUsageRestoredAt: Date.now() }, { merge: true });
  tx.create(db.collection('financial_audit_logs').doc(`promo_usage_restore_${orderId}`), {
    eventType: 'promotion_coupon_usage_restored', code, userId: userId || null, orderId,
    usageCountAfter: nextUserUsage, totalUsageAfter: nextTotalUsage, createdAt: Date.now()
  });
  return true;
}

async function syncProductVisibleReviews(db, productId) {
  const pid = String(productId || '');
  if (!pid) return;
  const revSnap = await db.collection('reviews').where('productId', '==', pid).get();
  const visibleReviews = [];
  revSnap.forEach(doc => {
    const d = doc.data();
    if (d && d.hidden !== true) {
      visibleReviews.push({
        id: d.id || doc.id,
        userId: d.userId || '',
        name: d.userName || d.name || 'Customer',
        rating: Number(d.rating || 5),
        text: d.text || '',
        photos: Array.isArray(d.photos) ? d.photos : [],
        pointsAwarded: Number(d.pointsAwarded || 0),
        time: Number(d.createdAt || d.time || Date.now())
      });
    }
  });
  visibleReviews.sort((a, b) => (b.time || 0) - (a.time || 0));
  await db.collection('products').doc(pid).set({
    reviews: visibleReviews,
    updatedAt: Date.now()
  }, { merge: true });
}


function collectProductImageUrls(product) {
  const found = new Set();
  const visit = (value, key = '') => {
    if (typeof value === 'string') {
      if (/^(images?|imageUrl|imageURL|img|photo|thumbnail|cover)$/i.test(key) || /^https:\/\//i.test(value)) {
        try {
          const u = new URL(value);
          if (u.protocol === 'https:' && (u.hostname === 'ik.imagekit.io' || u.hostname.endsWith('.imagekit.io'))) { const parts = decodeURIComponent(u.pathname).split('/').filter(Boolean); const productionIndex = parts.indexOf('production'); if (productionIndex >= 0) found.add('/' + parts.slice(productionIndex).join('/')); }
        } catch (_) {}
      }
    } else if (Array.isArray(value)) value.forEach(item => visit(item, key));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => visit(v, k));
  };
  visit(product || {});
  return [...found];
}

async function deleteProductImageKitAssets(product) {
  const urls = collectProductImageUrls(product);
  const storedAssets = Array.isArray(product && product.imageKitAssets) ? product.imageKitAssets : [];
  const storedFileIds = new Set(storedAssets.map(a => a && String(a.fileId || '').trim()).filter(Boolean));
  if (!urls.length && !storedFileIds.size) return { deleted: 0, skipped: 0 };
  const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
  if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY မရှိပါ။ ပုံမဖျက်ဘဲ Product Delete ကို ရပ်ထားပါသည်။');
  const auth = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
  const targets = new Set(urls);
  const fileIds = new Set(storedFileIds);
  // Legacy products without stored file IDs are resolved by exact production path.
  for (const targetPath of targets) {
    const fileName = targetPath.split('/').pop();
    if (!fileName) continue;
    const query = `name="${fileName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    let skip = 0;
    while (true) {
      const endpoint = new URL('https://api.imagekit.io/v1/files');
      endpoint.searchParams.set('searchQuery', query);
      endpoint.searchParams.set('limit', '1000');
      endpoint.searchParams.set('skip', String(skip));
      const response = await fetch(endpoint, { headers: { Authorization: auth, Accept: 'application/json' } });
      if (!response.ok) throw new Error(`ImageKit ပုံစာရင်းဖတ်မရပါ (${response.status})။ Product ကို မဖျက်ထားပါ။`);
      const files = await response.json();
      if (!Array.isArray(files)) throw new Error('ImageKit ပုံစာရင်းပုံစံ မမှန်ပါ။ Product ကို မဖျက်ထားပါ။');
      for (const file of files) {
        if (!file || !file.fileId || !file.url) continue;
        try {
          const fileUrl = new URL(file.url);
          const listedPath = String(file.filePath || (fileUrl.pathname.split('/').slice(2).join('/') ? '/' + fileUrl.pathname.split('/').slice(2).join('/') : ''));
          if (decodeURIComponent(listedPath) === targetPath) fileIds.add(String(file.fileId));
        } catch (_) {}
      }
      if (files.length < 1000) break;
      skip += files.length;
      if (skip > 20000) throw new Error('ImageKit ရှာဖွေမှု အကန့်အသတ်ကျော်နေပါသည်။ Product ကို မဖျက်ထားပါ။');
    }
  }
  let deleted = 0;
  for (const fileId of fileIds) {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, { method: 'DELETE', headers: { Authorization: auth, Accept: 'application/json' } });
    if (!response.ok && response.status !== 404) throw new Error(`ImageKit ပုံဖျက်မရပါ (${response.status})။ Database Product ကို မဖျက်ထားပါ။`);
    deleted++;
  }
  return { deleted, skipped: urls.length - fileIds.size };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  try {
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Invalid JSON request body.' })
      };
    }

    const action = String(body.action || '').trim();

    if (action === 'customer_create_order') {
      initFirebaseAdmin();
      const db = admin.firestore();
      const orderData = body.order;
      if (!orderData || !orderData.id || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Invalid order payload.' }) };
      }

      // Checkout is account-only. Never accept a client-created guest UID here:
      // otherwise unauthenticated callers can create orders and reserve stock.
      const customer = await verifyCustomerToken(event);
      const requestedUserId = String(orderData.userId || '').trim();
      if (requestedUserId && requestedUserId !== customer.uid) {
        throw new Error('Order Account သည် လက်ရှိ Login ဝင်ထားသော Account နှင့် မကိုက်ညီပါ။');
      }
      const paymentMethodValue = String(orderData.paymentMethod || '').toLowerCase();
      const isCODOrder = paymentMethodValue.includes('cod') || String(orderData.paymentMethodId || '').toUpperCase() === 'COD';
      const isPOLCity = isPyinOoLwinCity(orderData.city);
      if (isCODOrder && !isPOLCity) {
        throw new Error('COD ဝန်ဆောင်မှုကို ပြင်ဦးလွင် (POL / မေမြို့) မြို့တွင်းသာ ရရှိပါသည်။ အခြားမြို့များအတွက် KPay သို့မဟုတ် WavePay ကို ရွေးချယ်ပါ။');
      }
      if (!isCODOrder && (typeof orderData.paymentSlip !== 'string' || !/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(orderData.paymentSlip) || orderData.paymentSlip.length > 750000)) {
        throw new Error('KPay / WavePay ငွေလွှဲ Screenshot ကို မှန်ကန်စွာ တင်ပြီးမှ Order တင်နိုင်ပါသည်။');
      }
      const userId = customer.uid;
      const orderId = String(orderData.id).trim().replace(/^#+/, '');
      const normalizedId = orderId.startsWith('ord_') ? orderId : `ord_${orderId}`;
      if (!/^ord_[A-Za-z0-9_-]{6,120}$/.test(normalizedId)) throw new Error('Invalid order ID.');
      const orderRef = db.collection('orders').doc(normalizedId);
      const cashbackUseRequested = Math.floor(Number(orderData.cashbackUseAmount || 0));
      const pointsUseRequested = Math.floor(Number(orderData.pointsUseAmount || 0));
      if (!Number.isFinite(cashbackUseRequested) || cashbackUseRequested < 0) throw new Error('Cashback အသုံးပြုမည့် ပမာဏ မမှန်ကန်ပါ။');
      if (!Number.isFinite(pointsUseRequested) || pointsUseRequested < 0) throw new Error('Points အသုံးပြုမည့် ပမာဏ မမှန်ကန်ပါ။');
      if ((cashbackUseRequested > 0 || pointsUseRequested > 0) && (!customer || String(customer.uid) !== userId)) throw new Error('Points/Cashback အသုံးပြုရန် Login ဝင်ထားသော Customer Account လိုအပ်ပါသည်။');
      const cashbackUserRef = customer ? db.collection('users').doc(userId) : null;
      const couponCode = orderData.couponCode ? String(orderData.couponCode).trim().toUpperCase() : null;
      if (couponCode && !/^[A-Z0-9_-]{3,40}$/.test(couponCode)) throw new Error('Coupon Code မမှန်ကန်ပါ။');
      const redeemedRef = couponCode ? db.collection('redeemed_coupons').doc(couponCode) : null;
      const promoCouponsRef = db.collection('store_config').doc('coupons');
      const isRegularPromoCode = Boolean(couponCode && !/^(RWD|MS)/.test(couponCode));
      const promoUsageRef = isRegularPromoCode && customer ? db.collection('promo_coupon_usage').doc(crypto.createHash('sha256').update(`${couponCode}:${userId}`).digest('hex')) : null;
      let promoCounterRef = null;
      let legacyTotalCouponUsageCount = 0;
      let legacyUserCouponUsageCount = 0;
      let legacyUserCouponOrderIds = [];
      if (isRegularPromoCode && customer) {
        const priorCouponConfig = await promoCouponsRef.get();
        const priorPromoExists = priorCouponConfig.exists && Array.isArray((priorCouponConfig.data() || {}).items) && (priorCouponConfig.data() || {}).items.some(item => String(item.code || '').trim().toUpperCase() === couponCode && item.isRewardCoupon !== true && item.disabled !== true);
        if (priorPromoExists) {
          const counter = await ensurePromoCouponCounter(db, couponCode);
          promoCounterRef = counter.ref;
          legacyTotalCouponUsageCount = counter.usageCount;
        }
      }
      if (promoUsageRef) {
        const userUsage = await ensurePromoUserUsage(db, couponCode, userId);
        legacyUserCouponUsageCount = userUsage.usageCount;
        legacyUserCouponOrderIds = userUsage.orderIds;
      }
      const productRefs = orderData.items.map(item => db.collection('products').doc(String(item.id || '')));
      const uniqueIds = productRefs.map(r => r.id);
      if (uniqueIds.some(id => !id) || new Set(uniqueIds).size !== uniqueIds.length) throw new Error('Order items မမှန်ကန်ပါ။');

      const result = await db.runTransaction(async (tx) => {
        const existingSnap = await tx.get(orderRef);
        if (existingSnap.exists) {
          const old = existingSnap.data() || {};
          if (String(old.userId || '') !== userId) throw new Error('Order ID already belongs to another customer.');
          return { alreadyExists: true, order: old };
        }
        const [productSnaps, couponSnap, promoCouponsSnap, cashbackUserSnap, rewardSettingsSnap, promoUsageSnap, promoCounterSnap] = await Promise.all([
          Promise.all(productRefs.map(ref => tx.get(ref))),
          redeemedRef ? tx.get(redeemedRef) : Promise.resolve(null),
          tx.get(promoCouponsRef),
          cashbackUserRef ? tx.get(cashbackUserRef) : Promise.resolve(null),
          tx.get(db.collection('store_config').doc('reward_settings')),
          promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null),
          promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null)
        ]);
        let rawTotal = 0;
        const cleanItems = orderData.items.map((item, idx) => {
          const snap = productSnaps[idx];
          if (!snap.exists) throw new Error(`ပစ္စည်း မတွေ့ပါ: ${String(item.id || '')}`);
          const product = snap.data() || {};
          // Coming Soon-only products are display-only. Enforce this on the server,
          // so stale carts, browser history and forged checkout payloads cannot order them.
          if (product.deleting === true || product.deleted === true) throw new Error(`ဤပစ္စည်းကို ဖယ်ရှားနေပါသည် သို့မဟုတ် ဖျက်ပြီးဖြစ်သောကြောင့် Order တင်၍မရပါ: ${String(product.name || item.id)}`);
          if (isComingSoonOnlyProduct(product)) {
            throw new Error(`ဤပစ္စည်းသည် Coming Soon ဖြစ်နေသေးသောကြောင့် Order တင်၍မရသေးပါ: ${String(product.name || item.id)}`);
          }
          const qty = Math.floor(Number(item.qty) || 0);
          const price = Number(product.price);
          if (!Number.isFinite(qty) || qty < 1 || qty > 100 || !Number.isFinite(price) || price < 0) throw new Error('ပစ္စည်းအရေအတွက် သို့မဟုတ် ဈေးနှုန်း မမှန်ကန်ပါ။');
          const stock = Number(product.stock || 0);
          if (stock < qty) throw new Error(`လက်ကျန်ပစ္စည်း မလုံလောက်ပါ: ${product.name || item.id}`);
          const lineTotal = price * qty;
          if (!Number.isFinite(lineTotal) || lineTotal < 0 || lineTotal > 1000000000000) throw new Error('Order ပစ္စည်းတန်ဖိုးသည် သတ်မှတ်ထားသော အများဆုံးပမာဏထက် ကျော်လွန်နေပါသည်။');
          rawTotal += lineTotal;
          if (!Number.isFinite(rawTotal) || rawTotal > 1000000000000) throw new Error('Order စုစုပေါင်းတန်ဖိုး မမှန်ကန်ပါ။');
          return {
            id: snap.id, name: String(product.name || item.name || ''), price, qty,
            category: String(product.category || ''), brand: String(product.brand || ''),
            size: String(item.size || item.selectedSize || ''), selectedSize: String(item.selectedSize || item.size || ''),
            color: String(item.color || ''), img: String(product.img || item.img || '').slice(0, 180000)
          };
        });

        // Never trust a discount amount sent by the browser. Discounts are
        // recalculated here from a server-owned coupon record only.
        let discountAmount = 0;
        let rewardCouponToMarkUsed = false;
        if (couponCode) {
          if (couponSnap && couponSnap.exists) {
            const rewardSettings = rewardSettingsSnap && rewardSettingsSnap.exists ? rewardSettingsSnap.data() || {} : {};
            if (rewardSettings.rewardCouponsEnabled === false) throw new Error('Admin မှ Reward Coupon အသုံးပြုခွင့်ကို ယာယီပိတ်ထားပါသည်။');
            const c = couponSnap.data() || {};
            if (String(c.userId || '') !== userId) throw new Error('ဤ Reward Coupon သည် သင့်အကောင့်အတွက် မဟုတ်ပါ။');
            if (c.revoked === true || c.revokedBySourceRefund === true) throw new Error('ဤ Reward Coupon ကို မူလ Order Refund ကြောင့် ပယ်ဖျက်ထားပါသည်။');
            if (c.used === true) throw new Error('ဤ Reward Coupon ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။');
            if (Number(c.expiresAt || 0) > 0 && Number(c.expiresAt) <= Date.now()) throw new Error('ဤ Reward Coupon သက်တမ်းကုန်ဆုံးသွားပါပြီ။');
            const percent = Math.min(90, Math.max(1, Number(c.percent) || 0));
            const allowed = Array.isArray(c.productIds) ? c.productIds : ['all'];
            const eligibleSubtotal = cleanItems.reduce((sum, item) => sum + ((allowed.includes('all') || allowed.includes(item.id)) ? item.price * item.qty : 0), 0);
            if (eligibleSubtotal <= 0) throw new Error('ဤ Reward Coupon သည် ခြင်းတောင်းထဲရှိ သတ်မှတ်ထားသော ပစ္စည်းများနှင့် အကျုံးမဝင်ပါ။');
            const minPurchase = Math.max(0, Number(c.minPurchase || 0));
            if (eligibleSubtotal < minPurchase) throw new Error(`ဤ Coupon အသုံးပြုရန် သတ်မှတ်ထားသော Products များကို အနည်းဆုံး ${minPurchase.toLocaleString()} Ks ဖိုး ဝယ်ယူရန်လိုပါသည်။ လက်ရှိ ${eligibleSubtotal.toLocaleString()} Ks သာရှိပါသည်။`);
            const percentDiscount = Math.round(eligibleSubtotal * percent / 100);
            const maxDiscount = Math.max(0, Number(c.maxDiscount || 0));
            discountAmount = maxDiscount > 0 ? Math.min(percentDiscount, maxDiscount) : percentDiscount;
            rewardCouponToMarkUsed = true;
          } else {
            const promoItems = promoCouponsSnap && promoCouponsSnap.exists && Array.isArray((promoCouponsSnap.data() || {}).items)
              ? (promoCouponsSnap.data() || {}).items : [];
            const promo = promoItems.find(item => String(item.code || '').trim().toUpperCase() === couponCode && item.isRewardCoupon !== true);
            if (!promo || promo.disabled === true) throw new Error('Coupon မမှန်ကန်ပါ သို့မဟုတ် ပယ်ဖျက်ထားပါသည်။');
            if (Number(promo.expiresAt || 0) > 0 && Number(promo.expiresAt) <= Date.now()) throw new Error('ဤ Coupon သက်တမ်းကုန်ဆုံးသွားပါပြီ။');
            if (!customer || !promoUsageRef) throw new Error('Promotion Coupon အသုံးပြုရန် Customer Account ဖြင့် Login ဝင်ထားရန်လိုအပ်ပါသည်။');
            const currentUserUsage = promoUsageSnap && promoUsageSnap.exists
              ? safeFinancialCount((promoUsageSnap.data() || {}).usageCount)
              : legacyUserCouponUsageCount;
            const activePromoCounterRef = promoCounterRef || db.collection('promo_coupon_counters').doc(couponCode);
            const activePromoCounterSnap = promoCounterSnap || await tx.get(activePromoCounterRef);
            const currentTotalUsage = activePromoCounterSnap && activePromoCounterSnap.exists ? safeFinancialCount((activePromoCounterSnap.data() || {}).usageCount) : legacyTotalCouponUsageCount;
            const usageLimits = assertPromoUsageAllowed(promo, currentTotalUsage, currentUserUsage);
            const percent = Math.min(90, Math.max(1, Number(promo.percent) || 0));
            const allowed = Array.isArray(promo.productIds) && promo.productIds.length ? promo.productIds.map(String) : ['all'];
            const eligibleSubtotal = cleanItems.reduce((sum, item) => sum + ((allowed.includes('all') || allowed.includes(item.id)) ? item.price * item.qty : 0), 0);
            if (eligibleSubtotal <= 0) throw new Error('ဤ Coupon သည် ခြင်းတောင်းထဲရှိ ပစ္စည်းများနှင့် အကျုံးမဝင်ပါ။');
            const rawPromoDiscount = Math.round(eligibleSubtotal * percent / 100);
            const promoMaxDiscount = Math.max(0, Number(promo.maxDiscount || 0));
            discountAmount = promoMaxDiscount > 0 ? Math.min(rawPromoDiscount, promoMaxDiscount) : rawPromoDiscount;
            tx.set(activePromoCounterRef, { code: couponCode, usageCount: currentTotalUsage + 1, lastUsedAt: Date.now(), updatedAt: Date.now() }, { merge: true });
            const promoUsageOrderIds = promoUsageSnap && promoUsageSnap.exists
              ? (Array.isArray(promoUsageSnap.data()?.orderIds) ? promoUsageSnap.data().orderIds.map(String) : [])
              : legacyUserCouponOrderIds;
            if (promoUsageOrderIds.includes(normalizedId)) throw new Error('ဤ Order ID ဖြင့် Coupon အသုံးပြုမှုကို မှတ်တမ်းတင်ပြီးသားဖြစ်ပါသည်။');
            tx.set(promoUsageRef, { code: couponCode, userId, usageCount: currentUserUsage + 1, orderIds: [...promoUsageOrderIds, normalizedId].slice(-10000), lastUsedAt: Date.now(), lastOrderId: normalizedId }, { merge: true });
            tx.create(db.collection('financial_audit_logs').doc(`coupon_${normalizedId}`), {
              eventType: 'promotion_coupon_used', code: couponCode, userId, orderId: normalizedId,
              discountAmount, totalUsageAfter: currentTotalUsage + 1,
              userUsageAfter: currentUserUsage + 1, totalUsageLimit: usageLimits.total,
              perUserUsageLimit: usageLimits.perUser, createdAt: Date.now()
            });
          }
        }

        const rewardSettings = rewardSettingsSnap && rewardSettingsSnap.exists ? getRewardSettings(rewardSettingsSnap.data()) : DEFAULT_REWARD_SETTINGS;
        const safetySettings = normalizeFinancialSafety(rewardSettings);
        assertStackingAllowed({ coupon: Boolean(couponCode), points: pointsUseRequested > 0, cashback: cashbackUseRequested > 0 }, safetySettings);
        const minPayableAmount = Math.max(1, Math.floor(Number(rewardSettings.minPayableAmount ?? 1000)));
        if (rawTotal < minPayableAmount) throw new Error(`အနည်းဆုံး ပေးချေရမည့်ငွေ ${minPayableAmount.toLocaleString()} Ks ပြည့်ရန်လိုပါသည်။`);
        // Keep at least the configured minimum payable amount after all discounts.
        discountAmount = Math.min(discountAmount, Math.max(0, rawTotal - minPayableAmount));
        discountAmount = Math.min(discountAmount, totalDiscountCap(rawTotal, safetySettings));
        if (rewardCouponToMarkUsed) tx.update(redeemedRef, { used: true, usedAt: Date.now(), usedOrderId: normalizedId, usedDiscountAmount: discountAmount });
        const totalAfterCoupon = Math.max(0, Math.round(rawTotal - discountAmount));
        const walletUserData = cashbackUserSnap && cashbackUserSnap.exists ? cashbackUserSnap.data() || {} : {};
        const walletBalance = Math.max(0, Number(walletUserData.cashbackBalance || 0));
        const pointsBalance = Math.max(0, Number(walletUserData.pointsBalance || 0));
        if (pointsUseRequested > pointsBalance) throw new Error(`Points လက်ကျန် ${pointsBalance.toLocaleString()} Pts သာရှိပါသည်။`);
        if (pointsUseRequested > 0 && rewardSettings.checkoutPointsEnabled !== true) throw new Error('Admin မှ Checkout Points အသုံးပြုခွင့်ကို ဖွင့်မထားသေးပါ။');
        const pointsPer1000Ks = Math.max(1, Math.floor(Number(rewardSettings.pointsPer1000Ks || 100)));
        const pointsBlocks = Math.floor(pointsUseRequested / pointsPer1000Ks);
        const pointsUsed = pointsBlocks * pointsPer1000Ks;
        const pointsDiscountAmount = pointsBlocks * 1000;
        if (pointsUseRequested !== pointsUsed) throw new Error(`Points ကို ${pointsPer1000Ks} Pts အဆင့်လိုက်သာ အသုံးပြုနိုင်ပါသည်။`);
        if (pointsDiscountAmount > 0 && (!customer || !cashbackUserRef)) throw new Error('Points အသုံးပြုရန် Customer Login လိုအပ်ပါသည်။');
        if (cashbackUseRequested > walletBalance) throw new Error(`Cashback လက်ကျန် ${walletBalance.toLocaleString()} Ks သာရှိပါသည်။`);
        const remainingBeforeCashback = totalAfterCoupon - pointsDiscountAmount;
        if (remainingBeforeCashback < minPayableAmount) throw new Error(`Coupon/Points လျှော့ပြီးနောက် အနည်းဆုံး ${minPayableAmount.toLocaleString()} Ks ပေးချေရန် ကျန်ရပါမည်။ အသုံးပြုမည့် Points ကို လျှော့ပါ။`);
        const maxCashbackAllowed = cashbackUseCap(
          remainingBeforeCashback,
          rawTotal,
          discountAmount + pointsDiscountAmount,
          minPayableAmount,
          safetySettings
        );
        if (cashbackUseRequested > maxCashbackAllowed) throw new Error(`Order တစ်ခုတွင် Cashback ကို ကျန်ငွေ၏ ${safetySettings.maxCashbackUsePercent}% အထိသာ အသုံးပြုနိုင်ပါသည်။ အများဆုံး ${maxCashbackAllowed.toLocaleString()} Ks သာ အသုံးပြုနိုင်ပါသည်။`);
        const cashbackUsed = cashbackUseRequested;
        const { total: combinedDiscount } = assertTotalDiscountWithinCap(rawTotal, [discountAmount, pointsDiscountAmount, cashbackUsed], safetySettings);
        const finalTotal = Math.max(minPayableAmount, remainingBeforeCashback - cashbackUsed);
        const now = Date.now();
        let cashbackWallet = null;
        if (cashbackUsed > 0 && cashbackUserRef) {
          const walletUser = cashbackUserSnap.data() || {};
          const nextBalance = walletBalance - cashbackUsed;
          const nextTotalUsed = Math.max(0, Number(walletUser.cashbackTotalUsed || 0)) + cashbackUsed;
          const history = Array.isArray(walletUser.cashbackHistory) ? walletUser.cashbackHistory.slice() : [];
          const historyEntry = { id: `use_${normalizedId}`, type: 'used', amount: cashbackUsed, orderId: normalizedId, createdAt: now, balanceAfter: nextBalance };
          history.unshift(historyEntry);
          tx.set(cashbackUserRef, { cashbackBalance: nextBalance, cashbackTotalUsed: nextTotalUsed, cashbackHistory: history.slice(0, 100), updatedAt: now }, { merge: true });
          tx.create(db.collection('cashback_ledger').doc(`use_${normalizedId}`), { id: `use_${normalizedId}`, userId, orderId: normalizedId, type: 'used', amount: cashbackUsed, balanceBefore: walletBalance, balanceAfter: nextBalance, createdAt: now });
          cashbackWallet = { balance: nextBalance, totalUsed: nextTotalUsed, history: history.slice(0, 100) };
        }
        let pointsWallet = null;
        if (pointsUsed > 0 && cashbackUserRef) {
          const nextPointsBalance = pointsBalance - pointsUsed;
          const pointsHistory = Array.isArray(walletUserData.pointsHistory) ? walletUserData.pointsHistory.slice() : [];
          pointsHistory.unshift({ id: `checkout_${normalizedId}`, type: 'checkout_used', points: pointsUsed, discountAmount: pointsDiscountAmount, orderId: normalizedId, createdAt: now, balanceAfter: nextPointsBalance });
          tx.set(cashbackUserRef, { pointsBalance: nextPointsBalance, pointsTotalUsed: Math.max(0, Number(walletUserData.pointsTotalUsed || 0)) + pointsUsed, pointsHistory: pointsHistory.slice(0, 100), updatedAt: now }, { merge: true });
          tx.create(db.collection('points_ledger').doc(`checkout_${normalizedId}`), { id: `checkout_${normalizedId}`, userId, type: 'checkout_redemption', pointsDelta: -pointsUsed, balanceBefore: pointsBalance, balanceAfter: nextPointsBalance, discountAmount: pointsDiscountAmount, orderId: normalizedId, reason: 'Checkout Points အသုံးပြုမှု', createdAt: now });
          pointsWallet = { balance: nextPointsBalance, totalUsed: Math.max(0, Number(walletUserData.pointsTotalUsed || 0)) + pointsUsed };
        }
        const sanitizedOrder = {
          id: normalizedId, userId,
          customerEmail: customer ? customer.email : String(orderData.customerEmail || '').trim().slice(0, 254),
          customerName: String(customer ? customer.name : orderData.customerName || '').trim().slice(0, 100),
          phone: String(orderData.phone || '').trim().slice(0, 40),
          city: String(orderData.city || '').trim().slice(0, 100),
          address: String(orderData.address || '').trim().slice(0, 500),
          paymentMethod: String(orderData.paymentMethod || 'KBZPay').slice(0, 50),
          paymentSlip: orderData.paymentSlip || null,
          couponCode: couponCode || null, discountAmount, cashbackUsed, pointsUsed, pointsDiscountAmount, minPayableAmount,
          items: cleanItems, subtotal: rawTotal, totalAmount: finalTotal,
          status: 'pending', createdAt: Number(orderData.createdAt) || now, updatedAt: now
        };
        tx.create(orderRef, sanitizedOrder);
        tx.create(db.collection('financial_audit_logs').doc(`checkout_${normalizedId}`), {
          eventType: 'checkout_discount_applied', userId, orderId: normalizedId, couponCode: couponCode || null,
          couponDiscount: discountAmount, pointsUsed, pointsDiscountAmount, cashbackUsed,
          totalDiscount: discountAmount + pointsDiscountAmount + cashbackUsed, rawTotal, finalTotal, createdAt: now
        });
        productSnaps.forEach((snap, idx) => {
          const product = snap.data() || {};
          tx.update(productRefs[idx], { stock: Number(product.stock || 0) - cleanItems[idx].qty, updatedAt: now });
        });
        return { alreadyExists: false, order: sanitizedOrder, cashbackWallet, pointsWallet };
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: normalizedId, order: result.order, alreadyExists: result.alreadyExists, cashbackWallet: result.cashbackWallet || null, pointsWallet: result.pointsWallet || null }) };
    }

    if (action === 'customer_add_review') {
      const { uid, email, name, db } = await verifyCustomerToken(event);
      const productId = String(body.productId || '').trim();
      const reviewInput = body.review || {};
      const rawRating = Number(reviewInput.rating);
      if (!Number.isInteger(rawRating) || rawRating < 1 || rawRating > 5) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Rating ကို 1 မှ 5 အတွင်း ရွေးချယ်ပါ။' }) };
      }
      const rating = rawRating;
      const text = String(reviewInput.text || '').trim();
      if (!productId || text.length < 20) {
        return {
          statusCode: 400,
          headers: JSON_HEADERS,
          body: JSON.stringify({ ok: false, error: 'Review စာသားကို အနည်းဆုံး စာလုံး ၂၀ ရေးပေးပါ။' })
        };
      }
      const photoCandidates = Array.isArray(reviewInput.photos) ? reviewInput.photos.filter(isTrustedImageKitUrl).slice(0, 4) : [];
      const photoChecks = await Promise.all(photoCandidates.map(async url => ({ url, valid: await verifyImageKitPhotoUrl(url, uid, productId) })));
      const photos = photoChecks.filter(x => x.valid).map(x => x.url);

      const deterministicReviewId = `rev_${uid}_${productId}`;
      const reviewRef = db.collection('reviews').doc(deterministicReviewId);
      // Permanent claim survives review deletion/moderation, preventing reward farming.
      // Canonical lifetime claim: one review-points reward per customer account + product.
      // Query legacy claim/review documents too, so older random review IDs cannot be used
      // to earn a second reward after this deployment.
      const rewardClaimRef = db.collection('review_reward_claims').doc(deterministicReviewId);
      const userRef = db.collection('users').doc(uid);
      const prodRef = db.collection('products').doc(productId);
      const rewardCfgRef = db.collection('store_config').doc('reward_settings');
      // Only a registered customer's completed, non-refunded order can qualify a review.
      // Read the customer's orders inside the same transaction so the purchase check
      // is server-authoritative; never trust a client-supplied order ID or purchase flag.
      const customerOrdersQuery = db.collection('orders').where('userId', '==', uid);

      const txResult = await db.runTransaction(async (tx) => {
        const [existingRevSnap, claimSnap, priorClaimsSnap, priorReviewsSnap, userSnap, prodSnap, cfgSnap, customerOrdersSnap] = await Promise.all([
          tx.get(reviewRef),
          tx.get(rewardClaimRef),
          tx.get(db.collection('review_reward_claims').where('userId', '==', uid).where('productId', '==', productId)),
          tx.get(db.collection('reviews').where('userId', '==', uid).where('productId', '==', productId)),
          tx.get(userRef),
          tx.get(prodRef),
          tx.get(rewardCfgRef),
          tx.get(customerOrdersQuery)
        ]);

        if (!prodSnap.exists) throw new Error('Product မရှိတော့ပါ။ Review တင်၍မရပါ။');

        const eligibleOrder = customerOrdersSnap.docs.find(orderDoc => {
          const order = orderDoc.data() || {};
          if (String(order.status || '').toLowerCase() !== 'completed') return false;
          if (isOrderRefunded(order)) return false;
          return Array.isArray(order.items) && order.items.some(item =>
            String(item.id || item.productId || '') === productId && Number(item.qty || 0) > 0
          );
        });
        // Reviews are allowed before purchase. Points remain pending until a
        // matching, non-refunded order reaches Completed on the server.

        const rewardCfg = cfgSnap.exists
          ? getRewardSettings(cfgSnap.data())
          : DEFAULT_REWARD_SETTINGS;
        const reviewSafety = normalizeFinancialSafety(rewardCfg);

        const existingRev = existingRevSnap.exists ? (existingRevSnap.data() || {}) : null;
        const legacyRewardedClaim = priorClaimsSnap.docs.some(d => {
          const data = d.data() || {};
          return data.userId === uid && data.productId === productId;
        });
        const legacyRewardedReview = priorReviewsSnap.docs.some(d => {
          const data = d.data() || {};
          return data.pointsRewarded === true && Number(data.pointsAwarded || 0) > 0;
        });
        const claimReversed = Boolean(claimSnap.exists && (claimSnap.data() || {}).reversedAt) || priorClaimsSnap.docs.some(d => Boolean((d.data() || {}).reversedAt));
        const alreadyRewarded = claimSnap.exists || legacyRewardedClaim || legacyRewardedReview || Boolean(existingRev && existingRev.pointsRewarded === true);

        let pointsToAward = 0;
        let pointsAttempted = 0;
        let pointsCapBlocked = false;
        if (!alreadyRewarded && eligibleOrder) {
          if (rating === 5) pointsToAward = Number(rewardCfg.points5Star ?? 0);
          else if (rating === 4) pointsToAward = Number(rewardCfg.points4Star ?? 0);
          if (rating >= 4 && photos.length > 0 && Number(rewardCfg.photoBonusPoints || 0) > 0) {
            pointsToAward += Number(rewardCfg.photoBonusPoints || 0);
          }
          pointsAttempted = pointsToAward;
          if (pointsToAward > reviewSafety.maxReviewPointsPerReview) { pointsCapBlocked = true; pointsToAward = 0; }
        }

        const userData = userSnap.exists ? (userSnap.data() || {}) : {};
        const prodData = prodSnap.exists ? (prodSnap.data() || {}) : {};
        const displayName = String(reviewInput.name || userData.name || name || email.split('@')[0] || 'Customer').trim();
        const currentPoints = Number(userData.pointsBalance || 0);
        const currentDebt = Math.max(0, Number(userData.pointsDebt || 0));
        const totalEarned = Number(userData.totalPointsEarned || 0);
        const debtPaid = Math.min(currentDebt, pointsToAward);
        const spendableAward = pointsToAward - debtPaid;
        const newPointsBalance = currentPoints + spendableAward;
        const newPointsDebt = currentDebt - debtPaid;
        const newTotalEarned = totalEarned + pointsToAward;
        const now = Date.now();

        const reviewRecord = {
          id: deterministicReviewId,
          productId,
          productName: String(prodData.name || body.productName || ''),
          userId: uid,
          userEmail: email,
          userName: displayName,
          name: displayName,
          rating,
          text,
          photos,
          hidden: existingRev ? Boolean(existingRev.hidden) : false,
          pointsRewarded: pointsToAward > 0 || (alreadyRewarded && !claimReversed && Boolean(existingRev && existingRev.pointsRewarded === true)),
          pointsAwarded: pointsToAward > 0 ? pointsToAward : (alreadyRewarded && !claimReversed ? Number((existingRev && existingRev.pointsAwarded) || (claimSnap.data() || {}).pointsAwarded || 0) : 0),
          verifiedPurchase: Boolean(eligibleOrder),
          verifiedOrderId: eligibleOrder ? eligibleOrder.id : null,
          rewardPending: !alreadyRewarded && !eligibleOrder && (rating >= 4),
          createdAt: existingRev ? Number(existingRev.createdAt || now) : now,
          updatedAt: now
        };

        tx.set(reviewRef, reviewRecord, { merge: true });
        if (pointsCapBlocked) tx.set(db.collection('financial_audit_logs').doc(`review_reward_blocked_${uid}_${productId}`), {
          eventType: 'review_reward_blocked_by_cap', userId: uid, productId, reviewId: deterministicReviewId,
          attemptedPoints: pointsAttempted,
          allowedPoints: reviewSafety.maxReviewPointsPerReview, createdAt: now
        }, { merge: true });

        // Backfill a stable claim marker when a previous version already rewarded this
        // customer/product pair. This marker survives review deletion and edits.
        if (alreadyRewarded && !claimSnap.exists) {
          tx.create(rewardClaimRef, {
            id: deterministicReviewId, userId: uid, productId, reviewId: deterministicReviewId,
            pointsAwarded: Number((existingRev && existingRev.pointsAwarded) ||
              (priorClaimsSnap.docs[0] && priorClaimsSnap.docs[0].data().pointsAwarded) ||
              (priorReviewsSnap.docs.find(d => (d.data() || {}).pointsRewarded === true)?.data().pointsAwarded) || 0),
            claimedAt: Date.now(), ...(claimReversed ? { reversedAt: Date.now(), migratedReversed: true } : {}), migrated: true, rule: 'one_reward_per_customer_per_product'
          });
        }

        if (pointsToAward > 0) {
          tx.set(userRef, {
            uid,
            email,
            name: displayName,
            pointsBalance: newPointsBalance,
            pointsDebt: newPointsDebt,
            totalPointsEarned: newTotalEarned,
            updatedAt: now
          }, { merge: true });

          const ledgerId = `led_rev_${uid}_${productId}`;
          const ledgerRef = db.collection('points_ledger').doc(ledgerId);
          tx.create(rewardClaimRef, {
            id: deterministicReviewId, userId: uid, productId, reviewId: deterministicReviewId,
            pointsAwarded: pointsToAward, claimedAt: now, verifiedOrderId: eligibleOrder ? eligibleOrder.id : null, rule: 'one_reward_per_customer_per_product'
          });
          tx.create(db.collection('financial_audit_logs').doc(`review_reward_${uid}_${productId}`), {
            eventType: 'review_points_issued', userId: uid, productId, reviewId: deterministicReviewId,
            pointsAwarded: pointsToAward, createdAt: now
          });
          tx.set(ledgerRef, {
            id: ledgerId,
            userId: uid,
            userEmail: email,
            userName: displayName,
            type: 'review_reward',
            pointsDelta: spendableAward,
            grossPointsAwarded: pointsToAward,
            pointsDebtPaid: debtPaid,
            pointsDebtAfter: newPointsDebt,
            balanceBefore: currentPoints,
            balanceAfter: newPointsBalance,
            reason: `${rating}-Star Review (${prodData.name || productId})${photos.length ? ' + Photo' : ''}`,
            referenceId: deterministicReviewId,
            productId,
            createdAt: now
          });
        }

        return {
          review: reviewRecord,
          pointsAwarded: pointsToAward,
          pointsDebtPaid: debtPaid,
          alreadyRewarded,
          rewardPending: !alreadyRewarded && !eligibleOrder && rating >= 4,
          pointsBalance: newPointsBalance
        };
      });

      await syncProductVisibleReviews(db, productId);

      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: true,
          ...txResult
        })
      };
    }

    if (action === 'customer_redeem_reward') {
      const { uid, email, name, db } = await verifyCustomerToken(event);
      const tierId = String(body.tierId || '').trim();
      const requestId = String(body.requestId || `req_${Date.now()}`).trim();
      if (!/^[A-Za-z0-9_-]{8,100}$/.test(requestId)) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Invalid redemption request ID.' }) };
      }

      if (!tierId) {
        return {
          statusCode: 400,
          headers: JSON_HEADERS,
          body: JSON.stringify({ ok: false, error: 'Missing reward tierId.' })
        };
      }

      const userRef = db.collection('users').doc(uid);
      const rewardCfgRef = db.collection('store_config').doc('reward_settings');
      const idempotencyRef = db.collection('points_ledger').doc(`led_redeem_${uid}_${requestId}`);

      const redeemResult = await db.runTransaction(async (tx) => {
        const [idemSnap, userSnap, cfgSnap] = await Promise.all([
          tx.get(idempotencyRef),
          tx.get(userRef),
          tx.get(rewardCfgRef)
        ]);

        if (idemSnap.exists) {
          const prev = idemSnap.data() || {};
          return {
            alreadyProcessed: true,
            couponCode: prev.couponCode,
            discountPercent: prev.discountPercent,
            pointsBalance: prev.balanceAfter,
            pointsCost: Number(prev.pointsCost || Math.abs(Number(prev.pointsDelta || 0)))
          };
        }

        const rewardCfg = cfgSnap.exists
          ? getRewardSettings(cfgSnap.data())
          : DEFAULT_REWARD_SETTINGS;
        if (rewardCfg.rewardCouponTiersEnabled === false) throw new Error('Admin မှ Reward Coupon Tier အသစ်လဲလှယ်ခွင့်ကို ယာယီပိတ်ထားပါသည်။');
        const tiers = Array.isArray(rewardCfg.tiers) ? rewardCfg.tiers : [];
        const tier = tiers.find(t => String(t.id) === tierId);
        if (!tier) {
          throw new Error('Selected reward tier is no longer available.');
        }

        const cost = Math.max(1, parseInt(tier.pointsCost, 10) || 100);
        const discountPercent = Math.min(90, Math.max(1, parseInt(tier.discountPercent, 10) || 5));

        const userData = userSnap.exists ? (userSnap.data() || {}) : {};
        const currentPoints = Number(userData.pointsBalance || 0);
        const pointsDebt = Math.max(0, Number(userData.pointsDebt || 0));
        if (pointsDebt > 0) throw new Error(`Refund ကြောင့် ပြန်လည်ပေးဆပ်ရန် Points ${pointsDebt} ကျန်ရှိနေပါသည်။ Points အသစ်ရရှိပြီးမှ Coupon လဲလှယ်နိုင်ပါမည်။`);
        if (currentPoints < cost) {
          throw new Error(`Points မလုံလောက်ပါ။ လိုအပ်သော Points: ${cost} (လက်ရှိ: ${currentPoints})`);
        }

        const newBalance = currentPoints - cost;
        const randomSuffix = crypto.randomBytes(5).toString('hex').toUpperCase();
        const couponCode = `RWD${discountPercent}-${randomSuffix}`;
        const now = Date.now();

        const couponDocRef = db.collection('redeemed_coupons').doc(couponCode);
        // A tier-specific validity setting overrides the legacy global default.
        // Legacy tiers without validityDays keep their existing global behavior.
        const tierHasValidity = tier.validityDays !== undefined && tier.validityDays !== null && tier.validityDays !== '';
        const couponValidityDays = Math.min(3650, Math.max(0, Math.floor(Number(tierHasValidity ? tier.validityDays : (rewardCfg.couponValidityDays || 0)))));
        const expiresAt = couponValidityDays > 0 ? now + couponValidityDays * 86400000 : null;
        const rawProductIds = Array.isArray(tier.productIds) ? tier.productIds.map(id => String(id).trim()).filter(Boolean).slice(0, 100) : ['all'];
        const couponProductIds = rawProductIds.includes('all') || rawProductIds.length === 0 ? ['all'] : rawProductIds.filter(id => id !== 'all');
        const couponRecord = {
          code: couponCode,
          percent: discountPercent,
          productIds: couponProductIds,
          minPurchase: Math.min(1000000000000, Math.max(0, Math.floor(Number(tier.minPurchase) || 0))),
          maxDiscount: Math.min(1000000000, Math.max(0, Math.floor(Number(tier.maxDiscount) || 0))),
          userId: uid,
          userEmail: email,
          tierId: tier.id,
          pointsCost: cost,
          used: false,
          validityDays: couponValidityDays,
          expiresAt,
          createdAt: now
        };

        tx.set(couponDocRef, couponRecord);
        const pointsTotalUsed = Math.max(0, Number(userData.pointsTotalUsed || 0)) + cost;
        const pointsHistory = Array.isArray(userData.pointsHistory) ? userData.pointsHistory.slice() : [];
        pointsHistory.unshift({ id: idempotencyRef.id, type: 'coupon_redeem', points: cost, couponCode, createdAt: now, balanceAfter: newBalance });
        tx.set(userRef, {
          pointsBalance: newBalance,
          pointsTotalUsed,
          pointsHistory: pointsHistory.slice(0, 100),
          updatedAt: now
        }, { merge: true });

        tx.create(db.collection('financial_audit_logs').doc(`reward_redeem_${uid}_${requestId}`), {
          eventType: 'reward_coupon_redeemed', userId: uid, couponCode, pointsCost: cost,
          discountPercent, createdAt: now
        });
        tx.set(idempotencyRef, {
          id: idempotencyRef.id,
          userId: uid,
          userEmail: email,
          userName: userData.name || name,
          type: 'reward_redeem',
          pointsDelta: -cost,
          balanceBefore: currentPoints,
          balanceAfter: newBalance,
          couponCode,
          discountPercent,
          reason: `Redeemed ${discountPercent}% OFF Coupon (${couponCode})`,
          referenceId: couponCode,
          createdAt: now
        });

        return {
          couponCode,
          discountPercent,
          pointsCost: cost,
          pointsBalance: newBalance
        };
      });

      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: true, ...redeemResult })
      };
    }

    if (action === 'customer_reconcile_cashback') {
      const { uid, db } = await verifyCustomerToken(event);
      const userRef = db.collection('users').doc(uid);
      const [userSnap, ordersSnap, ledgerSnap, rewardLedgerSnap, cfgSnap] = await Promise.all([
        userRef.get(),
        db.collection('orders').where('userId', '==', uid).get(),
        db.collection('cashback_ledger').where('userId', '==', uid).get(),
        db.collection('purchase_reward_ledger').where('userId', '==', uid).get(),
        db.collection('store_config').doc('reward_settings').get()
      ]);
      const user = userSnap.exists ? userSnap.data() || {} : {};
      const eligibleOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })).filter(order => {
        const status = String(order.status || '').toLowerCase();
        return status === 'completed' && !order.refundedAt && order.refunded !== true;
      });
      const spendOf = order => Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0)));
      const lifetimeSpend = eligibleOrders.reduce((sum, order) => sum + spendOf(order), 0);
      const currentMonthKey = myanmarMonthKey(Date.now());
      const cfgRaw = cfgSnap.exists ? (cfgSnap.data() || {}) : {};
      const cfg = cfgSnap.exists ? getRewardSettings(cfgRaw) : DEFAULT_REWARD_SETTINGS;
      const lifetimeTierVersion = Math.max(1, Number(cfgRaw.purchaseTiersVersion || 1));
      const monthlyTierVersion = Math.max(1, Number(cfgRaw.monthlyPurchaseTiersVersion || 1));
      const lifetimeActivatedAt = Math.max(0, Number(cfgRaw.purchaseTiersActivatedAt || 0));
      const monthlyActivatedAt = Math.max(0, Number(cfgRaw.monthlyPurchaseTiersActivatedAt || 0));
      const monthlyActivationMonthKey = String(cfgRaw.monthlyPurchaseTiersActivationMonthKey || '');
      const tierStamp = order => Number(order.completedAt || order.createdAt || 0);
      const isLifetimeTierOrder = order => !lifetimeActivatedAt || tierStamp(order) >= lifetimeActivatedAt;
      const isMonthlyTierOrder = order => !monthlyActivatedAt || monthlyActivationMonthKey !== currentMonthKey || tierStamp(order) >= monthlyActivatedAt;
      const lifetimeTierSpend = eligibleOrders.filter(isLifetimeTierOrder).reduce((sum, order) => sum + spendOf(order), 0);
      const monthSpend = eligibleOrders.reduce((sum, order) => {
        const stamp = tierStamp(order);
        return stamp && myanmarMonthKey(stamp) === currentMonthKey ? sum + spendOf(order) : sum;
      }, 0);
      const currentMonthTierSpend = eligibleOrders.filter(order => {
        const stamp = tierStamp(order);
        return stamp && myanmarMonthKey(stamp) === currentMonthKey && isMonthlyTierOrder(order);
      }).reduce((sum, order) => sum + spendOf(order), 0);
      const chronologicalEligibleOrders = eligibleOrders.slice().sort((a, b) => tierStamp(a) - tierStamp(b));
      const findThresholdOrderId = (threshold, monthKey = null, programType = 'lifetime') => {
        let runningSpend = 0;
        for (const order of chronologicalEligibleOrders) {
          const stamp = tierStamp(order);
          if (programType === 'lifetime' && !isLifetimeTierOrder(order)) continue;
          if (programType === 'monthly' && (!stamp || myanmarMonthKey(stamp) !== monthKey || !isMonthlyTierOrder(order))) continue;
          if (monthKey && programType !== 'monthly' && (!stamp || myanmarMonthKey(stamp) !== monthKey)) continue;
          runningSpend += spendOf(order);
          if (runningSpend >= Number(threshold)) return String(order.id || '');
        }
        return null;
      };
      const lifetimeTiers = cfg.lifetimeCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.purchaseTiers) ? cfg.purchaseTiers : []).filter(t => t && t.rewardType === 'cashback' && Number(t.threshold) > 0 && Number(t.rewardValue) > 0);
      const monthlyTiers = cfg.monthlyCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.monthlyPurchaseTiers) ? cfg.monthlyPurchaseTiers : []).filter(t => t && Number(t.threshold) > 0 && Number(t.rewardValue) > 0);
      const ledgerRows = ledgerSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
      const rewardRows = rewardLedgerSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
      const lifetimeClaimKey = tierId => lifetimeTierVersion > 1 ? `${lifetimeTierVersion}:${tierId}` : String(tierId);
      const monthlyClaimKey = (monthKey, tierId) => monthlyTierVersion > 1 ? `${monthKey}:${monthlyTierVersion}:${tierId}` : `${monthKey}:${tierId}`;
      const claimedLifetime = new Set((Array.isArray(user.purchaseRewardTierIds) ? user.purchaseRewardTierIds : []).map(String));
      const claimedMonthly = new Set((Array.isArray(user.monthlyPurchaseRewardTierKeys) ? user.monthlyPurchaseRewardTierKeys : []).map(String));
      // Legacy claims block only the original configuration generation. A changed
      // tier set receives a new generation, without erasing historical claims.
      (Array.isArray(user.purchaseRewardHistory) ? user.purchaseRewardHistory : []).forEach(row => {
        if (!row || row.rewardType !== 'cashback') return;
        if (row.programType === 'monthly' && row.monthKey && Number(row.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(row.monthKey), String(row.id || row.tierId || '')));
        else if (row.programType === 'lifetime' && Number(row.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(row.id || row.tierId || '')));
      });
      ledgerRows.filter(x => x.type === 'earned').forEach(x => {
        if (x.programType === 'monthly' && Number(x.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(x.monthKey || ''), String(x.tierId || '')));
        else if (x.programType === 'lifetime' && Number(x.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(x.tierId || '')));
      });
      rewardRows.filter(x => x.rewardType === 'cashback').forEach(x => {
        if (x.programType === 'monthly' && Number(x.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(x.monthKey || ''), String(x.tierId || '')));
        else if (x.programType === 'lifetime' && Number(x.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(x.tierId || '')));
      });
      const pending = [];
      for (const tier of lifetimeTiers) {
        if (lifetimeTierSpend >= Number(tier.threshold) && !claimedLifetime.has(lifetimeClaimKey(String(tier.id)))) pending.push({ tier, programType: 'lifetime', monthKey: null, tierVersion: lifetimeTierVersion, orderId: findThresholdOrderId(tier.threshold, null, 'lifetime') });
      }
      const monthBuckets = new Map();
      eligibleOrders.forEach(order => {
        const stamp = Number(order.completedAt || order.createdAt || 0);
        if (!stamp) return;
        const key = myanmarMonthKey(stamp);
        monthBuckets.set(key, (monthBuckets.get(key) || 0) + spendOf(order));
      });
      // Monthly rewards are reconciled for the current Myanmar-calendar month only;
      // do not retroactively issue rewards for closed months that were never configured.
      const currentMonthSpendForTiers = currentMonthTierSpend;
      for (const tier of monthlyTiers) {
        const claimKey = monthlyClaimKey(currentMonthKey, String(tier.id));
        if (currentMonthSpendForTiers >= Number(tier.threshold) && !claimedMonthly.has(claimKey)) pending.push({ tier, programType: 'monthly', monthKey: currentMonthKey, tierVersion: monthlyTierVersion, orderId: findThresholdOrderId(tier.threshold, currentMonthKey, 'monthly') });
      }
      // Cashback caps have been retired; each configured reward is paid in full.
      const approved = pending;
      const now = Date.now();
      const claimRefs = approved.map(item => {
        const tierId = String(item.tier.id);
        const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, '_');
        const cashbackId = item.programType === 'monthly' ? `reconcile_monthly_${uid}_${item.monthKey}_${safeTierId}` : `reconcile_lifetime_${uid}_${safeTierId}`;
        const rewardId = item.programType === 'monthly' ? `reconcile_purchase_monthly_${uid}_${item.monthKey}_${safeTierId}` : `reconcile_purchase_lifetime_${uid}_${safeTierId}`;
        const claimId = item.programType === 'monthly'
          ? `${uid}_monthly_${item.monthKey}_${safeTierId}${item.tierVersion > 1 ? `_v${item.tierVersion}` : ''}`
          : `${uid}_lifetime_${safeTierId}${item.tierVersion > 1 ? `_v${item.tierVersion}` : ''}`;
        return {
          ...item, tierId,
          cashbackRef: db.collection('cashback_ledger').doc(cashbackId),
          rewardRef: db.collection('purchase_reward_ledger').doc(rewardId),
          claimRef: db.collection('cashback_reward_claims').doc(claimId),
          orderMarkerRef: item.orderId ? db.collection('purchase_order_rewards').doc(`${uid}_${item.orderId}`) : null,
          sourceOrder: item.orderId ? eligibleOrders.find(order => String(order.id) === String(item.orderId)) || null : null
        };
      });
      const earnedFromLedger = ledgerRows.reduce((sum, row) => sum + (row.type === 'earned' ? Math.max(0, Number(row.amount || 0)) : row.type === 'refund_reversal' ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
      const usedFromLedger = ledgerRows.reduce((sum, row) => sum + (row.type === 'used' ? Math.max(0, Number(row.amount || 0)) : ['refund_restore', 'cancel_restore'].includes(row.type) ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
      // Use the latest recorded wallet balance as the opening point, then replay
      // any later ledger events (older refund-reversal rows lacked balanceAfter).
      const orderedLedgerRows = ledgerRows.slice().sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
      let ledgerBalance = null;
      let ledgerBalanceIndex = -1;
      orderedLedgerRows.forEach((row, index) => {
        if (row.balanceAfter !== undefined && Number.isFinite(Number(row.balanceAfter))) {
          ledgerBalance = Math.max(0, Number(row.balanceAfter));
          ledgerBalanceIndex = index;
        }
      });
      if (ledgerBalanceIndex >= 0) {
        for (const row of orderedLedgerRows.slice(ledgerBalanceIndex + 1)) {
          if (row.type === 'earned') ledgerBalance += Math.max(0, Number(row.creditedAmount ?? row.amount ?? 0));
          else if (row.type === 'used' || row.type === 'refund_reversal') ledgerBalance = Math.max(0, ledgerBalance - Math.max(0, Number(row.amount || 0)));
          else if (row.type === 'refund_restore' || row.type === 'cancel_restore') ledgerBalance += Math.max(0, Number(row.amount || 0));
        }
      }
      let reconciled = { credited: 0, earned: 0, used: 0, count: 0 };
      await db.runTransaction(async tx => {
        const freshUserSnap = await tx.get(userRef);
        const freshUser = freshUserSnap.exists ? freshUserSnap.data() || {} : {};
        const markerRefsById = new Map(claimRefs.filter(item => item.orderMarkerRef).map(item => [item.orderMarkerRef.id, item.orderMarkerRef]));
        const markerRefs = [...markerRefsById.values()];
        const [claimSnaps, rewardClaimSnaps, freshLedgerSnap, markerSnaps] = await Promise.all([
          Promise.all(claimRefs.map(item => tx.get(item.cashbackRef))),
          Promise.all(claimRefs.map(item => tx.get(item.claimRef))),
          tx.get(db.collection('cashback_ledger').where('userId', '==', uid)),
          Promise.all(markerRefs.map(ref => tx.get(ref)))
        ]);
        const markerDataById = new Map(markerRefs.map((ref, index) => [ref.id, markerSnaps[index].exists ? markerSnaps[index].data() || {} : {}]));
        const markerUpdates = new Map();
        const freshLedgerRows = freshLedgerSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
        const freshEarnedFromLedger = freshLedgerRows.reduce((sum, row) => sum + (row.type === 'earned' ? Math.max(0, Number(row.amount || 0)) : row.type === 'refund_reversal' ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
        const freshUsedFromLedger = freshLedgerRows.reduce((sum, row) => sum + (row.type === 'used' ? Math.max(0, Number(row.amount || 0)) : ['refund_restore', 'cancel_restore'].includes(row.type) ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
        const freshOrderedLedgerRows = freshLedgerRows.slice().sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
        let freshLedgerBalance = null;
        let freshLedgerBalanceIndex = -1;
        freshOrderedLedgerRows.forEach((row, index) => {
          if (row.balanceAfter !== undefined && Number.isFinite(Number(row.balanceAfter))) {
            freshLedgerBalance = Math.max(0, Number(row.balanceAfter));
            freshLedgerBalanceIndex = index;
          }
        });
        if (freshLedgerBalanceIndex >= 0) {
          for (const row of freshOrderedLedgerRows.slice(freshLedgerBalanceIndex + 1)) {
            if (row.type === 'earned') freshLedgerBalance += Math.max(0, Number(row.creditedAmount ?? row.amount ?? 0));
            else if (row.type === 'used' || row.type === 'refund_reversal') freshLedgerBalance = Math.max(0, freshLedgerBalance - Math.max(0, Number(row.amount || 0)));
            else if (row.type === 'refund_restore' || row.type === 'cancel_restore') freshLedgerBalance += Math.max(0, Number(row.amount || 0));
          }
        }
        const freshBalance = freshLedgerBalance === null ? Math.max(0, Number(freshUser.cashbackBalance || 0)) : freshLedgerBalance;
        let balance = freshBalance;
        let debt = Math.max(0, Number(freshUser.cashbackDebt || 0));
        let creditedNow = 0;
        let newlyClaimedCount = 0;
        const newLifetimeIds = [];
        const newMonthlyKeys = [];
        const newHistory = Array.isArray(freshUser.purchaseRewardHistory) ? freshUser.purchaseRewardHistory.slice() : [];
        const newCashbackHistory = Array.isArray(freshUser.cashbackHistory) ? freshUser.cashbackHistory.slice() : [];
        for (let i = 0; i < claimRefs.length; i++) {
          const item = claimRefs[i];
          const rewardKey = item.programType === 'monthly' ? `monthly:${item.monthKey}:${item.tierVersion}:${item.tierId}` : `lifetime:${item.tierVersion}:${item.tierId}`;
          const markerId = item.orderMarkerRef ? item.orderMarkerRef.id : '';
          const markerExisting = markerId ? ((markerUpdates.get(markerId)?.data) || markerDataById.get(markerId) || {}) : {};
          const markerAlreadyHasReward = (Array.isArray(markerExisting.earnedRewards) ? markerExisting.earnedRewards : []).some(row => String(row.rewardKey || '') === rewardKey);
          if (claimSnaps[i].exists || rewardClaimSnaps[i].exists || markerAlreadyHasReward) continue;
          const value = Math.max(0, Math.floor(Number(item.tier.rewardValue || 0)));
          const debtPaid = Math.min(debt, value);
          debt -= debtPaid;
          balance += value - debtPaid;
          creditedNow += value;
          newlyClaimedCount += 1;
          const historyEntry = { id: item.tierId, programType: item.programType, monthKey: item.monthKey, tierVersion: item.tierVersion, threshold: Number(item.tier.threshold), rewardType: 'cashback', rewardValue: value, orderId: item.orderId || null, earnedAt: now, status: 'credited', cashbackDebtPaid: debtPaid, reconciled: true };
          newHistory.unshift(historyEntry);
          newCashbackHistory.unshift({ id: item.cashbackRef.id, type: 'earned', amount: value, creditedAmount: value - debtPaid, debtPaid, orderId: item.orderId || null, programType: item.programType, monthKey: item.monthKey, createdAt: now, balanceAfter: balance, reconciled: true });
          tx.create(item.cashbackRef, { id: item.cashbackRef.id, userId: uid, orderId: item.orderId || null, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, type: 'earned', amount: value, creditedAmount: value - debtPaid, debtPaid, balanceAfter: balance, source: 'completed_order_reconciliation', threshold: Number(item.tier.threshold), createdAt: now });
          tx.create(item.rewardRef, { id: item.rewardRef.id, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, userId: uid, userEmail: freshUser.email || '', userName: freshUser.name || '', orderId: item.orderId || null, threshold: Number(item.tier.threshold), rewardType: 'cashback', rewardValue: value, source: 'completed_order_reconciliation', createdAt: now });
          tx.create(item.claimRef, { id: item.claimRef.id, userId: uid, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, orderId: item.orderId || null, threshold: Number(item.tier.threshold), rewardValue: value, source: 'completed_order_reconciliation', createdAt: now });
          if (item.programType === 'monthly') newMonthlyKeys.push(monthlyClaimKey(item.monthKey, item.tierId));
          else newLifetimeIds.push(lifetimeClaimKey(item.tierId));
          if (item.orderMarkerRef && item.sourceOrder) {
            const markerId = item.orderMarkerRef.id;
            const base = (markerUpdates.get(markerId)?.data) || markerDataById.get(markerId) || {};
            const sourceOrder = item.sourceOrder;
            const sourceMonthKey = myanmarMonthKey(sourceOrder.completedAt || sourceOrder.createdAt || 0);
            const earnedRewards = Array.isArray(base.earnedRewards) ? base.earnedRewards.slice() : [];
            earnedRewards.push({ id: item.tierId, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, threshold: Number(item.tier.threshold), rewardType: 'cashback', rewardValue: value, couponCode: null, rewardKey });
            markerUpdates.set(markerId, {
              ref: item.orderMarkerRef,
              data: {
                userId: uid, orderId: item.orderId, totalAmount: Number(sourceOrder.totalAmount || 0),
                monthKey: sourceMonthKey, monthlyTotalSpent: monthBuckets.get(sourceMonthKey) || 0,
                earnedTierIds: [...new Set([...(Array.isArray(base.earnedTierIds) ? base.earnedTierIds.map(String) : []), ...(item.programType === 'lifetime' ? [item.tierId] : [])])],
                monthlyEarnedTierKeys: [...new Set([...(Array.isArray(base.monthlyEarnedTierKeys) ? base.monthlyEarnedTierKeys.map(String) : []), ...(item.programType === 'monthly' ? [`${item.monthKey}:${item.tierId}`] : [])])],
                cashbackCredited: Math.max(0, Number(base.cashbackCredited || 0)) + value,
                earnedRewards, issuedCoupons: Array.isArray(base.issuedCoupons) ? base.issuedCoupons : [], creditedAt: now,
                reconciled: true
              }
            });
          }
        }
        for (const markerUpdate of markerUpdates.values()) tx.set(markerUpdate.ref, markerUpdate.data, { merge: true });
        const earnedTotal = Math.max(0, freshLedgerRows.length ? freshEarnedFromLedger + creditedNow : Number(freshUser.cashbackTotalEarned || 0) + creditedNow);
        const usedTotal = Math.max(0, freshLedgerRows.length ? freshUsedFromLedger : Number(freshUser.cashbackTotalUsed || 0));
        tx.set(userRef, {
          purchaseTotalSpent: lifetimeSpend,
          purchaseOrderCount: eligibleOrders.length,
          monthlyPurchaseMonthKey: currentMonthKey,
          monthlyPurchaseTotalSpent: monthSpend,
          cashbackBalance: balance,
          cashbackDebt: debt,
          cashbackTotalEarned: earnedTotal,
          cashbackTotalUsed: usedTotal,
          purchaseRewardTierIds: [...new Set([...(Array.isArray(freshUser.purchaseRewardTierIds) ? freshUser.purchaseRewardTierIds.map(String) : []), ...newLifetimeIds])],
          monthlyPurchaseRewardTierKeys: [...new Set([...(Array.isArray(freshUser.monthlyPurchaseRewardTierKeys) ? freshUser.monthlyPurchaseRewardTierKeys.map(String) : []), ...newMonthlyKeys])],
          purchaseRewardHistory: newHistory.slice(0, 100),
          cashbackHistory: newCashbackHistory.slice(0, 100),
          updatedAt: now
        }, { merge: true });
        reconciled = { credited: creditedNow, earned: earnedTotal, used: usedTotal, count: newlyClaimedCount };
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, lifetimeSpend, monthSpend, currentMonthKey, eligibleOrderCount: eligibleOrders.length, newlyCredited: reconciled.credited, reconciledTierCount: reconciled.count, cashbackTotalEarned: reconciled.earned, cashbackTotalUsed: reconciled.used }) };
    }

    if (action === 'validate_coupon') {
      const { uid, db } = await verifyCustomerToken(event);
      const code = String(body.code || '').trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Coupon Code မမှန်ကန်ပါ။' }) };
      const [rSnap, rewardCfgSnap] = await Promise.all([
        db.collection('redeemed_coupons').doc(code).get(),
        db.collection('store_config').doc('reward_settings').get()
      ]);
      if (rSnap.exists) {
        const rewardCfg = rewardCfgSnap.exists ? rewardCfgSnap.data() || {} : {};
        if (rewardCfg.rewardCouponsEnabled === false) return { statusCode: 403, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Admin မှ Reward Coupon အသုံးပြုခွင့်ကို ယာယီပိတ်ထားပါသည်။' }) };
        const rData = rSnap.data() || {};
        if (String(rData.userId || '') !== uid) return { statusCode: 403, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'ဤ Reward Coupon သည် သင့်အကောင့်အတွက် မဟုတ်ပါ။' }) };
        if (rData.revoked === true || rData.revokedBySourceRefund === true) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'ဤ Reward Coupon ကို Refund ကြောင့် ပယ်ဖျက်ထားပါသည်။' }) };
        if (rData.used === true) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'ဤ Reward Coupon ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။' }) };
        if (Number(rData.expiresAt || 0) > 0 && Number(rData.expiresAt) <= Date.now()) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'ဤ Reward Coupon သက်တမ်းကုန်ဆုံးသွားပါပြီ။' }) };
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, coupon: { code: rData.code, percent: rData.percent, productIds: rData.productIds || ['all'], minPurchase: Math.max(0, Number(rData.minPurchase || 0)), maxDiscount: Math.max(0, Number(rData.maxDiscount || 0)), userId: rData.userId, expiresAt: rData.expiresAt || null, isRewardCoupon: true } }) };
      }
      const cfgSnap = await db.collection('store_config').doc('coupons').get();
      const promoItems = cfgSnap.exists && Array.isArray((cfgSnap.data() || {}).items) ? (cfgSnap.data() || {}).items : [];
      const promo = promoItems.find(item => String(item.code || '').trim().toUpperCase() === code && item.isRewardCoupon !== true);
      if (!promo || promo.disabled === true) return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Coupon မမှန်ကန်ပါ။' }) };
      if (Number(promo.expiresAt || 0) > 0 && Number(promo.expiresAt) <= Date.now()) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'ဤ Coupon သက်တမ်းကုန်ဆုံးသွားပါပြီ။' }) };
      const promoCounter = await ensurePromoCouponCounter(db, code);
      const userUsage = await ensurePromoUserUsage(db, code, uid);
      const userUsageCount = userUsage.usageCount;
      try { assertPromoUsageAllowed(promo, promoCounter.usageCount, userUsageCount); }
      catch (usageError) { return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: usageError.message }) }; }
      const usageLimits = getPromoUsageLimits(promo);
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, coupon: { code: String(promo.code).toUpperCase(), percent: Math.min(90, Math.max(1, Number(promo.percent) || 0)), productIds: Array.isArray(promo.productIds) ? promo.productIds : ['all'], maxDiscount: Math.max(0, Number(promo.maxDiscount || 0)), totalUsageLimit: usageLimits.total, perUserUsageLimit: usageLimits.perUser, usageCount: promoCounter.usageCount, expiresAt: promo.expiresAt || null, isRewardCoupon: false } }) };
    }

    const { uid: adminUid, email: adminEmail, role: adminRole, db } = await verifyAdminRequest(event);

    if (action === 'admin_query_audit_records') {
      const auditType = String(body.auditType || '').trim();
      const allowedSources = {
        points: ['points_ledger'],
        rewards: ['cashback_ledger', 'purchase_reward_ledger', 'financial_audit_logs'],
        financial: ['financial_audit_logs', 'points_audit_logs', 'cashback_ledger', 'purchase_reward_ledger']
      };
      if (!allowedSources[auditType]) throw new Error('Invalid audit center.');
      const pageSize = Math.max(10, Math.min(100, Math.floor(Number(body.pageSize) || 25)));
      const filters = body.filters && typeof body.filters === 'object' ? body.filters : {};
      const search = String(filters.search || '').trim().toLowerCase().slice(0, 120);
      const userId = String(filters.userId || '').trim().slice(0, 128);
      const dateFrom = Number.isFinite(Number(filters.dateFrom)) && Number(filters.dateFrom) > 0 ? Number(filters.dateFrom) : null;
      const dateTo = Number.isFinite(Number(filters.dateTo)) && Number(filters.dateTo) > 0 ? Number(filters.dateTo) : null;
      const activity = String(filters.activity || 'all').trim().toLowerCase();
      const status = String(filters.status || 'all').trim().toLowerCase();
      let cursor = body.cursor && typeof body.cursor === 'object' ? body.cursor : {};
      const cursorSources = cursor.sources && typeof cursor.sources === 'object' ? cursor.sources : {};
      const maxScanPerSource = 600;
      const batchSize = 100;
      const fieldPath = admin.firestore.FieldPath.documentId();
      const isMatch = (item, source) => {
        const createdAt = Number(item.createdAt || 0);
        if (dateFrom !== null && createdAt < dateFrom) return false;
        if (dateTo !== null && createdAt > dateTo) return false;
        if (userId && ![item.userId, item.targetUserId].some(v => String(v || '') === userId)) return false;
        if (auditType === 'rewards' && source === 'financial_audit_logs' && !new Set(['purchase_reward_issued','purchase_reward_blocked_by_cap','reward_coupon_redeemed','promotion_coupon_used','promotion_coupon_usage_restored','checkout_discount_applied']).has(String(item.eventType || ''))) return false;
        if (activity !== 'all' && !String(item.eventType || item.type || item.rewardType || item.action || '').toLowerCase().includes(activity)) return false;
        const statusText = `${item.status || ''} ${item.type || ''} ${item.eventType || ''}`.toLowerCase();
        if (status !== 'all') {
          const patterns = { success: /issued|earned|success|completed|recorded|admin_add|admin_adjustment/, used: /used|redeemed|checkout_redemption/, reversed: /revers|refund|restore/, blocked: /blocked|cap|denied|suspend/, failed: /failed|error/ };
          if (patterns[status] && !patterns[status].test(statusText)) return false;
          if (status === 'success' && /refund|revers|cancel|blocked|failed|error/.test(statusText)) return false;
        }
        if (search) {
          const searchable = [item.id,item.userId,item.targetUserId,item.userEmail,item.targetUserEmail,item.userName,item.targetUserName,item.orderId,item.refundOrderId,item.referenceId,item.productId,item.couponCode,item.code,item.eventType,item.type,item.rewardType,item.programType,item.tierId,item.tierVersion,item.reason,item.adminEmail,item.adminUid,item.status].map(v => String(v || '')).join(' ').toLowerCase();
          if (!searchable.includes(search)) return false;
        }
        return true;
      };
      const sourceResults = await Promise.all(allowedSources[auditType].map(async (source) => {
        const initial = cursorSources[source] && typeof cursorSources[source] === 'object' ? cursorSources[source] : null;
        let scanCursor = initial;
        let scanned = 0;
        let hasMoreSource = false;
        const matches = [];
        while (scanned < maxScanPerSource && matches.length <= pageSize) {
          let query = db.collection(source);
          if (dateFrom !== null) query = query.where('createdAt', '>=', dateFrom);
          if (dateTo !== null) query = query.where('createdAt', '<=', dateTo);
          query = query.orderBy('createdAt', 'desc').orderBy(fieldPath, 'desc');
          if (scanCursor && Number.isFinite(Number(scanCursor.createdAt)) && scanCursor.id) query = query.startAfter(Number(scanCursor.createdAt), String(scanCursor.id));
          const take = Math.min(batchSize, maxScanPerSource - scanned);
          const snap = await query.limit(take).get();
          if (snap.empty) { hasMoreSource = false; break; }
          snap.docs.forEach(doc => {
            const data = doc.data() || {};
            const item = { ...data, id: String(data.id || doc.id), _docId: doc.id, _sourceCollection: source };
            if (isMatch(item, source)) matches.push(item);
          });
          scanned += snap.size;
          const last = snap.docs[snap.docs.length - 1];
          scanCursor = { createdAt: Number((last.data() || {}).createdAt || 0), id: last.id };
          hasMoreSource = snap.size === take;
          if (!hasMoreSource || matches.length > pageSize) break;
        }
        matches.sort((a,b) => Number(b.createdAt||0)-Number(a.createdAt||0) || String(b._docId||b.id).localeCompare(String(a._docId||a.id)));
        return { source, initial, scanCursor, scanned, hasMoreSource, matches };
      }));
      const merged = sourceResults.flatMap(result => result.matches).sort((a,b) => Number(b.createdAt||0)-Number(a.createdAt||0) || String(a._sourceCollection).localeCompare(String(b._sourceCollection)) || String(b._docId||b.id).localeCompare(String(a._docId||a.id)));
      const rows = merged.slice(0, pageSize);
      const nextSources = {};
      for (const result of sourceResults) {
        const selected = rows.filter(item => item._sourceCollection === result.source);
        const sourceHasUnreturnedMatches = result.matches.length > selected.length;
        if (sourceHasUnreturnedMatches) {
          if (selected.length) {
            const lastSelected = selected[selected.length - 1];
            nextSources[result.source] = { createdAt: Number(lastSelected.createdAt || 0), id: String(lastSelected._docId || lastSelected.id) };
          } else if (result.initial) nextSources[result.source] = result.initial;
        } else if (result.scanCursor) {
          nextSources[result.source] = result.scanCursor;
        }
      }
      const hasMore = merged.length > pageSize || sourceResults.some(result => result.hasMoreSource || result.matches.length > rows.filter(item => item._sourceCollection === result.source).length);
      const nextCursor = hasMore ? { sources: nextSources } : null;
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, auditType, rows, nextCursor, hasMore, scanned: sourceResults.reduce((sum, result) => sum + result.scanned, 0), pageSize }) };
    }

    if (action === 'admin_imagekit_orphan_preview' || action === 'admin_imagekit_orphan_delete' || action === 'admin_product_maintenance_counts') {
      const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
      if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY မရှိပါ။');
      const auth = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
      const referencedUrls = new Set(), referencedIds = new Set();
      const scanValue = value => {
        if (typeof value === 'string') {
          if (/^https:\/\//i.test(value)) { try { const u = new URL(value); if (u.hostname === 'ik.imagekit.io' || u.hostname.endsWith('.imagekit.io')) referencedUrls.add(u.href.split('?')[0]); } catch (_) {} }
        } else if (Array.isArray(value)) value.forEach(scanValue);
        else if (value && typeof value === 'object') { if (value.fileId) referencedIds.add(String(value.fileId)); Object.values(value).forEach(scanValue); }
      };
      const scanCollection = async (col, depth = 0) => {
        if (depth > 3) return;
        const snap = await col.get();
        for (const doc of snap.docs) { scanValue(doc.data() || {}); if (depth < 3) { const nested = await doc.ref.listCollections(); for (const sub of nested) await scanCollection(sub, depth + 1); } }
      };
      const roots = await db.listCollections();
      for (const col of roots) await scanCollection(col);
      const files = []; let skip = 0;
      while (true) {
        const endpoint = new URL('https://api.imagekit.io/v1/files');
        endpoint.searchParams.set('path', '/production/products/'); endpoint.searchParams.set('limit', '1000'); endpoint.searchParams.set('skip', String(skip));
        const response = await fetch(endpoint, { headers: { Authorization: auth, Accept: 'application/json' } });
        if (!response.ok) throw new Error(`ImageKit စာရင်းဖတ်မရပါ (${response.status})`);
        const page = await response.json(); if (!Array.isArray(page)) throw new Error('ImageKit file list မမှန်ပါ။');
        files.push(...page.filter(f => String(f.filePath || '').startsWith('/production/products/')));
        if (page.length < 1000 || skip >= 20000) break; skip += page.length;
      }
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const candidates = files.filter(f => { const created = typeof f.createdAt === 'number' ? f.createdAt : Date.parse(f.createdAt || ''); return f.fileId && f.url && !referencedIds.has(String(f.fileId)) && !referencedUrls.has(String(f.url).split('?')[0]) && Number.isFinite(created) && created < cutoff; });
      if (action === 'admin_imagekit_orphan_preview') return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, candidates: candidates.map(f => ({ fileId: f.fileId, name: f.name, filePath: f.filePath, url: f.url, createdAt: f.createdAt })), scanned: files.length, graceDays: 7 }) };
      if (action === 'admin_product_maintenance_counts') {
        const pending = await db.collection('products').where('deleteRetryRequired', '==', true).limit(501).get();
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, retryDeleteCount: pending.size, unusedImageCount: candidates.length, scannedImages: files.length, graceDays: 7, checkedAt: Date.now() }) };
      }
      const requested = Array.isArray(body.fileIds) ? body.fileIds.map(String).slice(0, 100) : [];
      const eligible = candidates.filter(f => requested.includes(String(f.fileId)));
      let deleted = 0;
      for (const file of eligible) { const r = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(file.fileId)}`, { method: 'DELETE', headers: { Authorization: auth, Accept: 'application/json' } }); if (!r.ok && r.status !== 404) throw new Error(`ImageKit ပုံဖျက်မရပါ (${r.status})`); deleted++; }
      await db.collection('product_delete_audit').doc(`orphan_cleanup_${Date.now()}`).set({ eventType: 'orphan_image_cleanup', deleted, requested: requested.length, deletedBy: adminEmail, createdAt: Date.now() });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, deleted, skipped: requested.length - eligible.length }) };
    }

    if (action === 'admin_export_product_backup') {
      const [productsSnap, costsSnap] = await Promise.all([
        db.collection('products').get(), db.collection('product_costs').get()
      ]);
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
      const costs = {};
      costsSnap.forEach(doc => { costs[doc.id] = Math.max(0, Number((doc.data() || {}).costPrice || 0)); });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, backup: { schemaVersion: 1, projectId: process.env.FIREBASE_PROJECT_ID || '', exportedAt: new Date().toISOString(), products, costs } }) };
    }

    if (action === 'admin_restore_product_backup') {
      const backup = body.backup || {};
      if (backup.schemaVersion !== 1 || !Array.isArray(backup.products) || backup.products.length > 5000) throw new Error('Product Backup ဖိုင်ပုံစံ မမှန်ကန်ပါ။');
      const currentIds = new Set((await db.collection('products').get()).docs.map(d => d.id));
      const tombstoneIds = new Set((await db.collection('deleted_products').get()).docs.map(d => d.id));
      let batch = db.batch(), writes = 0, restored = 0, skipped = 0;
      for (const item of backup.products) {
        if (!item || !/^[A-Za-z0-9_-]{1,120}$/.test(String(item.id || '')) || !String(item.name || '').trim() || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) { skipped++; continue; }
        const id = String(item.id);
        if (currentIds.has(id) || tombstoneIds.has(id) || item.deleting === true || item.deleted === true) { skipped++; continue; }
        const { costPrice, ...publicProduct } = item;
        batch.create(db.collection('products').doc(id), { ...publicProduct, id, restoredFromBackupAt: Date.now(), restoredBy: adminEmail });
        if (backup.costs && Number.isFinite(Number(backup.costs[id]))) batch.set(db.collection('product_costs').doc(id), { productId: id, costPrice: Math.max(0, Math.floor(Number(backup.costs[id]))), updatedAt: Date.now(), updatedBy: adminEmail });
        writes += backup.costs && Number.isFinite(Number(backup.costs[id])) ? 2 : 1; restored++;
        if (writes >= 400) { await batch.commit(); batch = db.batch(); writes = 0; }
      }
      if (writes) await batch.commit();
      await db.collection('product_delete_audit').doc(`backup_restore_${Date.now()}`).set({ eventType: 'product_backup_restore', restored, skipped, restoredBy: adminEmail, createdAt: Date.now() });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, restored, skipped }) };
    }

    if (action === 'admin_retry_product_deletes') {
      const pendingSnap = await db.collection('products').where('deleteRetryRequired', '==', true).limit(25).get();
      let completed = 0, failed = 0;
      for (const doc of pendingSnap.docs) {
        const product = doc.data() || {};
        try {
          const imageCleanup = await deleteProductImageKitAssets(product);
          const batch = db.batch();
          batch.delete(doc.ref); batch.delete(db.collection('product_costs').doc(doc.id));
          batch.set(db.collection('deleted_products').doc(doc.id), { productId: doc.id, name: String(product.name || ''), deletedAt: Date.now(), deletedBy: adminEmail, imageCleanup }, { merge: true });
          batch.set(db.collection('product_delete_audit').doc(`${doc.id}_retry_${Date.now()}`), { productId: doc.id, deletedBy: adminEmail, deletedAt: Date.now(), imageCleanup, retry: true }, { merge: true });
          await batch.commit(); completed++;
        } catch (err) {
          failed++;
          await doc.ref.set({ deleteError: String(err.message || err).slice(0, 500), deleteRetryRequired: true, deleteUpdatedAt: Date.now() }, { merge: true });
        }
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, checked: pendingSnap.size, completed, failed }) };
    }

    if (action === 'admin_save_coupon') {
      const code = String(body.coupon && body.coupon.code || '').trim().toUpperCase();
      const percent = Math.floor(Number(body.coupon && body.coupon.percent) || 0);
      const rawIds = body.coupon && Array.isArray(body.coupon.productIds) ? body.coupon.productIds : ['all'];
      const expiresAt = body.coupon && body.coupon.expiresAt != null ? Number(body.coupon.expiresAt) : null;
      const totalUsageRaw = Number(body.coupon?.totalUsageLimit ?? DEFAULT_PROMO_TOTAL_USAGE_LIMIT);
      const perUserUsageRaw = Number(body.coupon?.perUserUsageLimit ?? 1);
      const maxDiscountRaw = Number(body.coupon?.maxDiscount ?? 0);
      if (![totalUsageRaw, perUserUsageRaw, maxDiscountRaw].every(Number.isFinite) || totalUsageRaw < 0 || perUserUsageRaw < 1 || maxDiscountRaw < 0) throw new Error('Coupon Usage Limit / Max Discount တန်ဖိုး မမှန်ကန်ပါ။');
      const totalUsageLimit = Math.min(10000000, Math.floor(totalUsageRaw));
      const perUserUsageLimit = Math.min(1000, Math.floor(perUserUsageRaw));
      const maxDiscount = Math.min(1000000000, Math.floor(maxDiscountRaw));
      if (expiresAt != null && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) throw new Error('Coupon Expired Date သည် အနာဂတ်ရက် ဖြစ်ရပါမည်။');
      const productIds = rawIds.map(id => String(id).trim()).filter(Boolean).slice(0, 100);
      if (!/^[A-Z0-9_-]{3,40}$/.test(code) || code.startsWith('RWD') || code.startsWith('MS')) throw new Error('Coupon Code မမှန်ကန်ပါ။ RWD/MS ဖြင့်စသော Code မသုံးပါနှင့်။');
      if (percent < 1 || percent > 90) throw new Error('Coupon Discount သည် 1% မှ 90% အတွင်း ဖြစ်ရပါမည်။');
      if (!productIds.length || (productIds.includes('all') && productIds.length > 1)) throw new Error('Coupon Product Scope မမှန်ကန်ပါ။');
      const cfgRef = db.collection('store_config').doc('coupons');
      const promoCounter = await ensurePromoCouponCounter(db, code);
      await db.runTransaction(async tx => {
        const [snap, counterSnap] = await Promise.all([tx.get(cfgRef), tx.get(promoCounter.ref)]);
        const items = snap.exists && Array.isArray((snap.data() || {}).items) ? (snap.data() || {}).items.slice() : [];
        const previous = items.find(item => String(item.code || '').toUpperCase() === code && item.isRewardCoupon !== true) || {};
        const counterUsageCount = counterSnap && counterSnap.exists ? safeFinancialCount((counterSnap.data() || {}).usageCount) : promoCounter.usageCount;
        const usageCount = Math.max(0, safeFinancialCount(previous.usageCount), counterUsageCount);
        const filtered = items.filter(item => String(item.code || '').toUpperCase() !== code || item.isRewardCoupon === true);
        filtered.unshift({ code, percent, productIds, expiresAt, maxDiscount, totalUsageLimit, perUserUsageLimit, usageCount, isRewardCoupon: false, createdAt: previous.createdAt || Date.now(), updatedAt: Date.now(), updatedBy: adminEmail });
        tx.set(cfgRef, { items: filtered.slice(0, 500), updatedAt: Date.now() }, { merge: true });
        tx.set(promoCounter.ref, { code, active: true, updatedAt: Date.now() }, { merge: true });
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, code, percent, productIds, expiresAt, maxDiscount, totalUsageLimit, perUserUsageLimit, usageCount: promoCounter.usageCount }) };
    }

    if (action === 'admin_delete_coupon') {
      const code = String(body.code || '').trim().toUpperCase();
      if (!code) throw new Error('Coupon Code လိုအပ်ပါသည်။');
      const cfgRef = db.collection('store_config').doc('coupons');
      const counterRef = db.collection('promo_coupon_counters').doc(code);
      await db.runTransaction(async tx => {
        const [snap, counterSnap] = await Promise.all([tx.get(cfgRef), tx.get(counterRef)]);
        const items = snap.exists && Array.isArray((snap.data() || {}).items) ? (snap.data() || {}).items : [];
        tx.set(cfgRef, { items: items.filter(item => String(item.code || '').toUpperCase() !== code || item.isRewardCoupon === true), updatedAt: Date.now() }, { merge: true });
        if (counterSnap.exists) tx.set(counterRef, { active: false, updatedAt: Date.now(), deactivatedAt: Date.now() }, { merge: true });
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, code }) };
    }

    if (action === 'admin_moderate_review') {
      const reviewId = String(body.reviewId || '').trim();
      const modAction = String(body.modAction || '').trim();
      const productId = String(body.productId || '').trim();

      if (!reviewId) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing reviewId.' }) };
      }
      if (!['delete', 'toggle_hide'].includes(modAction)) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Invalid modAction.' }) };
      }

      const revRef = db.collection('reviews').doc(reviewId);
      const moderationResult = await db.runTransaction(async tx => {
        const revSnap = await tx.get(revRef);
        if (!revSnap.exists) return { notFound: true, targetProdId: productId || '' };
        const oldReview = revSnap.data() || {};
        const targetProdId = productId || String(oldReview.productId || '');
        const ownerUid = String(oldReview.userId || '').trim();
        const ownerRef = ownerUid ? db.collection('users').doc(ownerUid) : null;
        const canonicalClaimRef = ownerUid && oldReview.productId
          ? db.collection('review_reward_claims').doc(`rev_${ownerUid}_${String(oldReview.productId)}`) : null;
        const legacyClaimsQuery = ownerUid && oldReview.productId
          ? db.collection('review_reward_claims').where('userId', '==', ownerUid).where('productId', '==', String(oldReview.productId)) : null;
        const [ownerSnap, canonicalClaimSnap, legacyClaimsSnap] = await Promise.all([
          ownerRef ? tx.get(ownerRef) : Promise.resolve(null),
          canonicalClaimRef ? tx.get(canonicalClaimRef) : Promise.resolve(null),
          legacyClaimsQuery ? tx.get(legacyClaimsQuery) : Promise.resolve(null)
        ]);

        const shouldReverse = modAction === 'delete' || Boolean(body.hidden);
        const canonicalClaim = canonicalClaimSnap && canonicalClaimSnap.exists ? canonicalClaimSnap.data() || {} : {};
        const legacyClaimDocs = legacyClaimsSnap ? legacyClaimsSnap.docs : [];
        const legacyReversal = legacyClaimDocs.map(doc => doc.data() || {}).find(data => data.reversedAt);
        const alreadyReversed = Boolean(oldReview.pointsReversedAt || canonicalClaim.reversedAt || legacyReversal);
        const priorReversalAt = Number(oldReview.pointsReversedAt || canonicalClaim.reversedAt || (legacyReversal && legacyReversal.reversedAt) || 0) || null;
        const reviewAward = oldReview.pointsRewarded === true ? Math.max(0, Number(oldReview.pointsAwarded || 0)) : 0;
        const claimAward = Math.max(0, Number(canonicalClaim.pointsAwarded || 0), ...legacyClaimDocs.map(doc => Math.max(0, Number((doc.data() || {}).pointsAwarded || 0))));
        const pointsToReverse = Math.max(reviewAward, claimAward);
        let pointsBalanceAfter = ownerSnap && ownerSnap.exists ? Math.max(0, Number((ownerSnap.data() || {}).pointsBalance || 0)) : 0;
        let pointsDebtAfter = ownerSnap && ownerSnap.exists ? Math.max(0, Number((ownerSnap.data() || {}).pointsDebt || 0)) : 0;
        let pointsReversed = 0;
        let debtAdded = 0;
        const now = Date.now();

        if (shouldReverse && pointsToReverse > 0 && !alreadyReversed) {
          const userData = ownerSnap && ownerSnap.exists ? ownerSnap.data() || {} : {};
          const balanceBefore = Math.max(0, Number(userData.pointsBalance || 0));
          const balanceUsed = Math.min(balanceBefore, pointsToReverse);
          debtAdded = pointsToReverse - balanceUsed;
          pointsBalanceAfter = balanceBefore - balanceUsed;
          pointsDebtAfter = Math.max(0, Number(userData.pointsDebt || 0)) + debtAdded;
          pointsReversed = pointsToReverse;
          if (ownerRef && ownerSnap && ownerSnap.exists) {
            tx.set(ownerRef, { pointsBalance: pointsBalanceAfter, pointsDebt: pointsDebtAfter, updatedAt: now }, { merge: true });
          }
          const reversalId = `review_moderation_${ownerUid}_${String(oldReview.productId || '')}`;
          tx.set(db.collection('points_ledger').doc(reversalId), {
            id: reversalId, userId: ownerUid, type: 'review_reward_moderation_reversal',
            pointsDelta: -balanceUsed, pointsReversed, debtAdded,
            balanceBefore, balanceAfter: pointsBalanceAfter, pointsDebtAfter,
            productId: String(oldReview.productId || ''), reviewId,
            reason: modAction === 'delete' ? 'Review deleted by Admin' : 'Review hidden by Admin',
            adminUid, adminEmail, createdAt: now
          }, { merge: false });
          tx.set(db.collection('financial_audit_logs').doc(reversalId), {
            eventType: 'review_points_reversed_by_moderation', userId: ownerUid,
            productId: String(oldReview.productId || ''), reviewId, pointsReversed, debtAdded,
            adminUid, adminEmail, createdAt: now
          }, { merge: true });
        }

        // Keep a permanent customer/product claim even after deletion or moderation.
        // This prevents unhide/repost/edit cycles from earning the same reward again.
        if (canonicalClaimRef && (pointsToReverse > 0 || canonicalClaimSnap?.exists || legacyClaimDocs.length)) {
          tx.set(canonicalClaimRef, {
            id: `rev_${ownerUid}_${String(oldReview.productId || '')}`,
            userId: ownerUid, productId: String(oldReview.productId || ''), reviewId,
            pointsAwarded: Math.max(pointsToReverse, Number(canonicalClaim.pointsAwarded || 0)),
            claimedAt: Number(canonicalClaim.claimedAt || oldReview.rewardGrantedAt || oldReview.updatedAt || oldReview.createdAt || now),
            ...(shouldReverse && pointsToReverse > 0 ? {
              reversedAt: priorReversalAt || now,
              reversedBy: canonicalClaim.reversedBy || adminUid,
              reversalReason: canonicalClaim.reversalReason || (modAction === 'delete' ? 'review_deleted' : 'review_hidden'),
              pointsReversed: Math.max(pointsToReverse, Number(canonicalClaim.pointsReversed || 0))
            } : {}),
            rule: 'one_reward_per_customer_per_product'
          }, { merge: true });
        }
        for (const legacyDoc of legacyClaimDocs) {
          const legacy = legacyDoc.data() || {};
          if (shouldReverse && pointsToReverse > 0 && !legacy.reversedAt && legacyDoc.id !== canonicalClaimRef?.id) {
            tx.set(legacyDoc.ref, {
              reversedAt: priorReversalAt || now, reversedBy: adminUid,
              reversalReason: modAction === 'delete' ? 'review_deleted' : 'review_hidden',
              pointsReversed: Number(legacy.pointsAwarded || 0)
            }, { merge: true });
          }
        }

        if (modAction === 'delete') {
          tx.delete(revRef);
        } else {
          tx.set(revRef, {
            hidden: Boolean(body.hidden),
            ...(shouldReverse && pointsToReverse > 0 ? {
              pointsRewarded: false, pointsAwarded: 0, pointsReversedAt: priorReversalAt || now,
              moderationPointsReversed: true
            } : {}),
            moderatedBy: adminEmail, moderatedAt: now, updatedAt: now
          }, { merge: true });
        }
        return { targetProdId, pointsReversed, debtAdded, pointsBalanceAfter, pointsDebtAfter };
      });

      if (moderationResult.targetProdId) {
        const pRef = db.collection('products').doc(String(moderationResult.targetProdId));
        if (modAction === 'delete') {
          const pSnap = await pRef.get();
          if (pSnap.exists) {
            const revs = Array.isArray(pSnap.data().reviews) ? pSnap.data().reviews : [];
            const filtered = revs.filter(r => String(r.id || r.time) !== reviewId);
            await pRef.set({ reviews: filtered, updatedAt: Date.now() }, { merge: true });
          }
        }
        await syncProductVisibleReviews(db, moderationResult.targetProdId);
      }
      if (moderationResult.notFound) {
        return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Review not found.' }) };
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({
        ok: true, ...(modAction === 'delete' ? { deleted: reviewId } : { reviewId, hidden: Boolean(body.hidden) }),
        pointsReversed: moderationResult.pointsReversed || 0,
        debtAdded: moderationResult.debtAdded || 0,
        pointsBalance: moderationResult.pointsBalanceAfter,
        pointsDebt: moderationResult.pointsDebtAfter
      }) };
    }

    if (action === 'admin_adjust_user_points') {
      const targetUserId = String(body.targetUserId || '').trim();
      const pointsDelta = parseInt(body.pointsDelta, 10);
      const reason = String(body.reason || '').trim();

      if (!targetUserId || !Number.isFinite(pointsDelta) || pointsDelta === 0 || !reason) {
        return {
          statusCode: 400,
          headers: JSON_HEADERS,
          body: JSON.stringify({ ok: false, error: 'Target User, non-zero Points amount, and Reason are required.' })
        };
      }

      const userRef = db.collection('users').doc(targetUserId);
      const now = Date.now();
      const auditId = `aud_${now}_${Math.random().toString(36).slice(2, 7)}`;
      const ledgerId = `led_adj_${now}_${Math.random().toString(36).slice(2, 7)}`;

      const adjResult = await db.runTransaction(async (tx) => {
        const uSnap = await tx.get(userRef);
        if (!uSnap.exists) {
          throw new Error('Target customer account not found in Firestore.');
        }
        const uData = uSnap.data() || {};
        const prevBalance = Number(uData.pointsBalance || 0);
        const prevDebt = Math.max(0, Number(uData.pointsDebt || 0));
        const requestedDelta = pointsDelta;
        const debtPaid = requestedDelta > 0 ? Math.min(prevDebt, requestedDelta) : 0;
        const nextDebt = prevDebt - debtPaid;
        const spendableDelta = requestedDelta > 0 ? requestedDelta - debtPaid : requestedDelta;
        const nextBalance = Math.max(0, prevBalance + spendableDelta);
        const actualDelta = nextBalance - prevBalance;
        const prevTotalEarned = Number(uData.totalPointsEarned || 0);
        const nextTotalEarned = requestedDelta > 0 ? prevTotalEarned + requestedDelta : prevTotalEarned;

        tx.set(userRef, {
          pointsBalance: nextBalance,
          pointsDebt: nextDebt,
          totalPointsEarned: nextTotalEarned,
          updatedAt: now
        }, { merge: true });

        const ledgerEntry = {
          id: ledgerId,
          userId: targetUserId,
          userEmail: uData.email || '',
          userName: uData.name || '',
          type: actualDelta >= 0 ? 'admin_add' : 'admin_deduct',
          pointsDelta: actualDelta,
          grossPointsAdjustment: requestedDelta,
          pointsDebtPaid: debtPaid,
          pointsDebtAfter: nextDebt,
          balanceBefore: prevBalance,
          balanceAfter: nextBalance,
          reason: `Admin Adjustment: ${reason}`,
          adminUid,
          adminEmail,
          createdAt: now
        };
        tx.set(db.collection('points_ledger').doc(ledgerId), ledgerEntry);

        const auditEntry = {
          id: auditId,
          targetUserId,
          targetUserEmail: uData.email || '',
          targetUserName: uData.name || '',
          pointsDelta: actualDelta,
          pointsDebtPaid: debtPaid,
          pointsDebtAfter: nextDebt,
          balanceBefore: prevBalance,
          balanceAfter: nextBalance,
          reason,
          adminUid,
          adminEmail,
          adminRole,
          createdAt: now
        };
        tx.set(db.collection('points_audit_logs').doc(auditId), auditEntry);

        return {
          targetUserId,
          balanceBefore: prevBalance,
          pointsBalance: nextBalance,
          actualDelta,
          pointsDebtPaid: debtPaid,
          pointsDebt: nextDebt,
          auditEntry
        };
      });

      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: true, ...adjResult })
      };
    }

    if (action === 'admin_adjust_user_cashback') {
      const targetUserId = String(body.targetUserId || '').trim();
      const cashbackDelta = Number(body.cashbackDelta);
      const reason = String(body.reason || '').trim();
      if (!targetUserId || !Number.isSafeInteger(cashbackDelta) || cashbackDelta === 0 || Math.abs(cashbackDelta) > 1000000000 || !reason || reason.length > 300) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Target User, valid non-zero Cashback amount, and Reason are required.' }) };
      }
      const userRef = db.collection('users').doc(targetUserId);
      const now = Date.now();
      const ledgerId = `admin_cashback_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const adjResult = await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists) throw new Error('Target customer account not found in Firestore.');
        const u = snap.data() || {};
        const before = Math.max(0, Number(u.cashbackBalance || 0));
        const oldDebt = Math.max(0, Number(u.cashbackDebt || 0));
        let debtPaid = 0, nextBalance = before, nextDebt = oldDebt;
        if (cashbackDelta > 0) { debtPaid = Math.min(oldDebt, cashbackDelta); nextDebt = oldDebt - debtPaid; nextBalance = before + cashbackDelta - debtPaid; }
        else { const deduction = Math.abs(cashbackDelta); const fromBalance = Math.min(before, deduction); nextBalance = before - fromBalance; nextDebt = oldDebt + deduction - fromBalance; }
        const actualDelta = nextBalance - before;
        const entry = { id: ledgerId, userId: targetUserId, userEmail: u.email || '', userName: u.name || '', type: 'admin_adjustment', amount: Math.abs(cashbackDelta), requestedDelta: cashbackDelta, actualDelta, debtPaid, balanceBefore: before, balanceAfter: nextBalance, debtBefore: oldDebt, debtAfter: nextDebt, reason: `Admin Adjustment: ${reason}`, adminUid, adminEmail, adminRole, createdAt: now };
        const history = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
        history.unshift(entry);
        tx.set(userRef, { cashbackBalance: nextBalance, cashbackDebt: nextDebt, cashbackTotalEarned: Math.max(0, Number(u.cashbackTotalEarned || 0)) + Math.max(0, cashbackDelta), cashbackHistory: history.slice(0, 100), updatedAt: now }, { merge: true });
        tx.create(db.collection('cashback_ledger').doc(ledgerId), entry);
        return { balanceBefore: before, cashbackBalance: nextBalance, actualDelta, cashbackDebtPaid: debtPaid, cashbackDebt: nextDebt, ledgerEntry: entry };
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, ...adjResult }) };
    }

    if (action === 'admin_save_reward_settings') {
      const settings = body.settings || {};
      const rawPurchaseTiers = Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers : [];
      const rawRedeemTiers = Array.isArray(settings.tiers) ? settings.tiers : [];
      if (rawRedeemTiers.some(t => Number(t.pointsCost) < 1 || Number(t.discountPercent) < 1 || Number(t.discountPercent) > 90 || Number(t.maxDiscount || 0) > 1000000)) throw new Error('Reward Coupon Tier Points Cost / Discount / Max Discount တန်ဖိုး မမှန်ကန်ပါ။');
      const sanitized = {
        points4Star: Math.max(0, Math.floor(Number.isFinite(Number(settings.points4Star)) ? Number(settings.points4Star) : 0)),
        points5Star: Math.max(0, Math.floor(Number.isFinite(Number(settings.points5Star)) ? Number(settings.points5Star) : 0)),
        photoBonusPoints: Math.max(0, Math.floor(Number.isFinite(Number(settings.photoBonusPoints)) ? Number(settings.photoBonusPoints) : 0)),
        couponValidityDays: Math.min(3650, Math.max(0, Math.floor(Number(settings.couponValidityDays || 0)))),
        rewardCouponsEnabled: settings.rewardCouponsEnabled !== false,
        rewardCouponTiersEnabled: settings.rewardCouponTiersEnabled !== false,
        lifetimeCashbackTiersEnabled: settings.lifetimeCashbackTiersEnabled !== false,
        monthlyCashbackTiersEnabled: settings.monthlyCashbackTiersEnabled !== false,
        minPayableAmount: Math.min(1000000000, Math.max(1, Math.floor(Number(settings.minPayableAmount ?? 1000)))),
        checkoutPointsEnabled: settings.checkoutPointsEnabled === true,
        pointsPer1000Ks: Math.min(1000000, Math.max(1, Math.floor(Number(settings.pointsPer1000Ks || 100)))),
        reverseReviewPointsOnRefund: settings.reverseReviewPointsOnRefund !== false,
        keepReviewAfterRefund: settings.keepReviewAfterRefund !== false,
        ...normalizeFinancialSafety(settings),
        tiers: Array.isArray(settings.tiers) ? settings.tiers.slice(0, 50).map((t, idx) => ({
          id: String(t.id || `tier_${idx + 1}`).slice(0, 80),
          pointsCost: Math.max(1, Math.floor(Number(t.pointsCost) || 100)),
          discountPercent: Math.min(90, Math.max(1, Math.floor(Number(t.discountPercent) || 5))),
          productIds: (Array.isArray(t.productIds) && t.productIds.length ? t.productIds.map(id => String(id).trim()).filter(Boolean).slice(0, 100) : ['all']).includes('all') ? ['all'] : (Array.isArray(t.productIds) ? t.productIds.map(id => String(id).trim()).filter(id => id && id !== 'all').slice(0, 100) : ['all']),
          minPurchase: Math.min(1000000000000, Math.max(0, Math.floor(Number(t.minPurchase) || 0))),
          maxDiscount: Math.min(1000000000, Math.max(0, Math.floor(Number(t.maxDiscount) || 0))),
          validityDays: Math.min(3650, Math.max(0, Math.floor(Number(t.validityDays ?? settings.couponValidityDays ?? 0)))),
          label: String(t.label || `${t.discountPercent}% OFF (${t.pointsCost} Pts)`).trim().slice(0, 100)
        })) : [],
        purchaseTiers: Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers.slice(0, 50).map((t, idx) => ({
          id: String(t.id || `purchase_tier_${idx + 1}`).slice(0, 80),
          threshold: Math.min(1000000000000, Math.max(1, Math.floor(Number(t.threshold) || 1))),
          rewardType: 'cashback',
          rewardValue: Math.min(1000000000, Math.max(0, Math.floor(Number(t.rewardValue) || 0))),
          label: String(t.label || '').slice(0, 100)
        })).sort((a, b) => a.threshold - b.threshold) : [],
        monthlyPurchaseTiers: Array.isArray(settings.monthlyPurchaseTiers) ? settings.monthlyPurchaseTiers.slice(0, 50).map((t, idx) => ({
          id: String(t.id || `monthly_purchase_tier_${idx + 1}`).slice(0, 80),
          threshold: Math.min(1000000000000, Math.max(1, Math.floor(Number(t.threshold) || 1))),
          rewardType: 'cashback',
          rewardValue: Math.min(1000000000, Math.max(0, Math.floor(Number(t.rewardValue) || 0))),
          label: String(t.label || '').slice(0, 100)
        })).sort((a, b) => a.threshold - b.threshold) : DEFAULT_REWARD_SETTINGS.monthlyPurchaseTiers,
        adminConfigVersion: 2,
        updatedBy: adminEmail,
        updatedAt: Date.now()
      };
      Object.assign(sanitized, validateRewardCaps({ ...sanitized, ...settings }));
      if (sanitized.tiers.some(t => t.discountPercent < 1 || t.discountPercent > 90 || t.pointsCost < 1 || t.maxDiscount > 1000000)) throw new Error('Reward Coupon Tier တန်ဖိုးများ မမှန်ကန်ပါ။');
      const tierIds = sanitized.tiers.map(t => t.id);
      const purchaseTierIds = sanitized.purchaseTiers.map(t => t.id);
      const monthlyPurchaseTierIds = sanitized.monthlyPurchaseTiers.map(t => t.id);
      if (new Set(tierIds).size !== tierIds.length || new Set(purchaseTierIds).size !== purchaseTierIds.length || new Set(monthlyPurchaseTierIds).size !== monthlyPurchaseTierIds.length) {
        throw new Error('Reward tier ID များ ထပ်နေပါသည်။');
      }
      if (sanitized.purchaseTiers.some((t, i, a) => i > 0 && t.threshold === a[i - 1].threshold) || sanitized.monthlyPurchaseTiers.some((t, i, a) => i > 0 && t.threshold === a[i - 1].threshold)) {
        throw new Error('Purchase reward threshold တန်ဖိုးများ မတူညီရပါ။');
      }
      const rewardSettingsRef = db.collection('store_config').doc('reward_settings');
      const previousSettingsSnap = await rewardSettingsRef.get();
      const previousSettings = previousSettingsSnap.exists ? (previousSettingsSnap.data() || {}) : {};
      const tierSignature = rows => JSON.stringify((Array.isArray(rows) ? rows : []).map(t => ({
        id: String(t.id || ''), threshold: Number(t.threshold || 0), rewardType: String(t.rewardType || 'cashback'), rewardValue: Number(t.rewardValue || 0)
      })).sort((a, b) => a.threshold - b.threshold || a.id.localeCompare(b.id)));
      const now = Date.now();
      const lifetimeTiersChanged = tierSignature(previousSettings.purchaseTiers) !== tierSignature(sanitized.purchaseTiers);
      const monthlyTiersChanged = tierSignature(previousSettings.monthlyPurchaseTiers) !== tierSignature(sanitized.monthlyPurchaseTiers);
      const lifetimeReenabled = previousSettings.lifetimeCashbackTiersEnabled === false && sanitized.lifetimeCashbackTiersEnabled === true;
      const monthlyReenabled = previousSettings.monthlyCashbackTiersEnabled === false && sanitized.monthlyCashbackTiersEnabled === true;
      sanitized.purchaseTiersVersion = Math.max(1, Number(previousSettings.purchaseTiersVersion || 0) + (lifetimeTiersChanged ? 1 : 0));
      sanitized.monthlyPurchaseTiersVersion = Math.max(1, Number(previousSettings.monthlyPurchaseTiersVersion || 0) + (monthlyTiersChanged ? 1 : 0));
      sanitized.purchaseTiersActivatedAt = lifetimeTiersChanged || lifetimeReenabled ? now : Math.max(0, Number(previousSettings.purchaseTiersActivatedAt || 0));
      sanitized.monthlyPurchaseTiersActivatedAt = monthlyTiersChanged || monthlyReenabled ? now : Math.max(0, Number(previousSettings.monthlyPurchaseTiersActivatedAt || 0));
      sanitized.monthlyPurchaseTiersActivationMonthKey = monthlyTiersChanged || monthlyReenabled ? myanmarMonthKey(now) : String(previousSettings.monthlyPurchaseTiersActivationMonthKey || '');
      await rewardSettingsRef.set(sanitized, { merge: true });
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: true, settings: sanitized })
      };
    }

    if (action === 'admin_get_product_costs') {
      const productsSnap = await db.collection('products').get();
      let batch = db.batch(), writes = 0;
      for (const doc of productsSnap.docs) {
        const data = doc.data() || {};
        if (data.costPrice !== undefined && Number.isFinite(Number(data.costPrice))) {
          batch.set(db.collection('product_costs').doc(doc.id), { productId: doc.id, costPrice: Math.max(0, Math.floor(Number(data.costPrice))), updatedAt: Date.now(), migratedFromPublicProduct: true }, { merge: true });
          batch.update(doc.ref, { costPrice: admin.firestore.FieldValue.delete(), updatedAt: Date.now() });
          writes += 2;
          if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
        }
      }
      if (writes > 0) await batch.commit();
      const costsSnap = await db.collection('product_costs').get();
      const costs = {};
      costsSnap.forEach(doc => { costs[doc.id] = Math.max(0, Number((doc.data() || {}).costPrice || 0)); });
      // Strip legacy cost data from order line-items too, so customers cannot read profit inputs.
      const ordersSnap = await db.collection('orders').get();
      batch = db.batch(); writes = 0;
      for (const doc of ordersSnap.docs) {
        const d = doc.data() || {}; if (!Array.isArray(d.items)) continue;
        let changed = false; const clean = d.items.map(item => { if (Object.prototype.hasOwnProperty.call(item || {}, 'costPrice')) { changed = true; const { costPrice, ...rest } = item; return rest; } return item; });
        if (changed) { batch.update(doc.ref, { items: clean }); writes++; if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; } }
      }
      if (writes > 0) await batch.commit();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, costs, migrated: true }) };
    }

    if (action === 'save_product') {
      const product = body.product;
      if (!product || !product.id) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing product data or product.id.' }) };
      }
      const docId = String(product.id);
      const { costPrice, ...publicProduct } = product;
      if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) throw new Error('Product ID မမှန်ကန်ပါ။');
      const productRef = db.collection('products').doc(docId);
      const [tombstone, existing] = await Promise.all([
        db.collection('deleted_products').doc(docId).get(), productRef.get()
      ]);
      if (tombstone.exists) throw new Error('ဖျက်ပြီးသား Product ID ကို ပြန်အသုံးမပြုနိုင်ပါ။ Product အသစ်ဖန်တီးပါ။');
      if (existing.exists && (existing.data() || {}).deleting === true) throw new Error('ဤ Product ကို ဖျက်နေဆဲဖြစ်သောကြောင့် ပြင်ဆင်၍မရပါ။');
      const cleanName = String(publicProduct.name || '').trim();
      if (!cleanName || cleanName.length > 180) throw new Error('Product အမည် မမှန်ကန်ပါ။');
      const price = Number(publicProduct.price);
      if (!Number.isFinite(price) || price < 0 || price > 1000000000) throw new Error('Product ဈေးနှုန်း မမှန်ကန်ပါ။');
      if (publicProduct.stock !== undefined && (!Number.isFinite(Number(publicProduct.stock)) || Number(publicProduct.stock) < 0)) throw new Error('Product Stock မမှန်ကန်ပါ။');
      const assets = Array.isArray(publicProduct.imageKitAssets) ? publicProduct.imageKitAssets : [];
      for (const asset of assets) {
        if (!asset || !isTrustedImageKitUrl(String(asset.url || '')) || (asset.fileId != null && String(asset.fileId).length > 200)) throw new Error('Product ပုံ URL / ImageKit File ID မမှန်ကန်ပါ။');
      }
      const batch = db.batch();
      batch.set(productRef, { ...publicProduct, name: cleanName, id: docId, updatedAt: Date.now(), deleting: false }, { merge: true });
      if (costPrice !== undefined && Number.isFinite(Number(costPrice))) batch.set(db.collection('product_costs').doc(docId), { productId: docId, costPrice: Math.max(0, Math.floor(Number(costPrice))), updatedAt: Date.now(), updatedBy: adminEmail }, { merge: true });
      await batch.commit();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
    }

    if (action === 'delete_product') {
      const docId = String(body.id || '');
      if (!docId) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing product id.' }) };
      }
      if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) throw new Error('Product ID မမှန်ကန်ပါ။');
      const productRef = db.collection('products').doc(docId);
      const productSnap = await productRef.get();
      if (!productSnap.exists) return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, alreadyMissing: true }) };
      const productData = productSnap.data() || {};
      // Mark unavailable first: checkout rejects deleting products while external ImageKit cleanup runs.
      await productRef.set({ deleting: true, deleteRequestedAt: Date.now(), deleteRequestedBy: adminEmail }, { merge: true });
      try {
        const imageCleanup = await deleteProductImageKitAssets(productData);
        const batch = db.batch();
        batch.delete(productRef);
        batch.delete(db.collection('product_costs').doc(docId));
        batch.set(db.collection('deleted_products').doc(docId), { productId: docId, name: String(productData.name || ''), deletedAt: Date.now(), deletedBy: adminEmail, imageCleanup }, { merge: true });
        batch.set(db.collection('product_delete_audit').doc(`${docId}_${Date.now()}`), { productId: docId, deletedBy: adminEmail, deletedAt: Date.now(), imageCleanup }, { merge: true });
        await batch.commit();
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, imageCleanup }) };
      } catch (cleanupError) {
        await productRef.set({ deleting: true, deleteError: String(cleanupError.message || cleanupError).slice(0, 500), deleteRetryRequired: true, deleteUpdatedAt: Date.now() }, { merge: true });
        throw new Error(`Product ကို Order တင်၍မရအောင် ပိတ်ထားပြီးပါပြီ။ ImageKit/Database cleanup မပြီးသေးပါ။ ပြန်လည်စမ်းသပ်ရန်လိုသည်။ ${cleanupError.message || cleanupError}`);
      }
    }

    if (action === 'sync_local_products') {
      const items = Array.isArray(body.products) ? body.products : [];
      let batch = db.batch(), count = 0, writes = 0;
      for (const p of items) {
        if (p && p.id) {
          const docId = String(p.id); if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) continue;
          const [deletedSnap, existingSnap] = await Promise.all([
            db.collection('deleted_products').doc(docId).get(),
            db.collection('products').doc(docId).get()
          ]);
          // Legacy browser migration is create-only: it must never overwrite current server data,
          // revive a deleting product, or restore a deleted product from stale localStorage.
          if (deletedSnap.exists || existingSnap.exists || p.deleting === true || p.deleted === true) continue;
          const { costPrice, ...publicProduct } = p;
          if (!String(publicProduct.name || '').trim() || !Number.isFinite(Number(publicProduct.price)) || Number(publicProduct.price) < 0) continue;
          batch.create(db.collection('products').doc(docId), { ...publicProduct, id: docId, createdAt: Date.now(), updatedAt: Date.now(), migratedFromLocal: true }); writes++;
          if (costPrice !== undefined && Number.isFinite(Number(costPrice))) { batch.set(db.collection('product_costs').doc(docId), { productId: docId, costPrice: Math.max(0, Math.floor(Number(costPrice))), updatedAt: Date.now(), updatedBy: adminEmail }, { merge: true }); writes++; }
          count++;
          if (writes >= 450) { await batch.commit(); batch = db.batch(); writes = 0; }
        }
      }
      if (writes > 0) await batch.commit();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, syncedCount: count }) };
    }

    if (action === 'save_order') {
      const order = body.order;
      if (!order || !order.id) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing order data.' }) };
      }
      const docId = String(order.id);
      const orderRef = db.collection('orders').doc(docId);
      const nextOrder = { ...order, id: docId, updatedAt: Date.now() };
      let purchaseReward = null;
      let orderWasCompleted = false;
      let completedOrderForRewards = nextOrder;
      await db.runTransaction(async (tx) => {
        const oldSnap = await tx.get(orderRef);
        const oldOrder = oldSnap.exists ? (oldSnap.data() || {}) : {};
        const oldStatus = String(oldOrder.status || '').toLowerCase();
        if (oldStatus === 'refunded' && String(nextOrder.status || '').toLowerCase() !== 'refunded') {
          throw new Error('Refund ပြုလုပ်ပြီးသော order ကို ပြန်လည်အသက်သွင်း၍မရပါ။');
        }
        if (oldStatus === 'cancelled' && String(nextOrder.status || '').toLowerCase() !== 'cancelled') {
          throw new Error('Cancel ပြုလုပ်ပြီးသော Order ကို ပြန်လည်အသက်သွင်း၍မရပါ။ Order အသစ်တင်ရန်လိုအပ်ပါသည်။');
        }
        const wasCompleted = oldStatus === 'completed';
        if (['pending', 'processing', 'shipped', 'failed'].includes(oldStatus) && ['cancelled', 'canceled'].includes(String(nextOrder.status || '').toLowerCase())) {
          throw new Error('Pending Order ကို Cancel လုပ်ရန် Admin Order List ရှိ Cancel/Delete action ကို အသုံးပြုပါ။ Stock, Coupon, Points နှင့် Cashback ကို အလိုအလျောက် ပြန်အမ်းပေးပါမည်။');
        }
        orderWasCompleted = wasCompleted;
        const isCompleted = String(nextOrder.status || '').toLowerCase() === 'completed';
        if (wasCompleted && !isCompleted) {
          throw new Error('Completed order ကို ပြန်လည် Pending/Cancelled ပြောင်း၍မရပါ။ Refund လုပ်ငန်းစဉ်ကို သီးခြားဆောင်ရွက်ပါ။');
        }
        if (wasCompleted && (Number(nextOrder.totalAmount) !== Number(oldOrder.totalAmount) || String(nextOrder.userId || oldOrder.userId || '') !== String(oldOrder.userId || ''))) {
          throw new Error('Completed order ၏ Customer နှင့် Amount ကို ပြင်ဆင်၍မရပါ။');
        }
        // On the first transition to Completed, use the server-stored order's
        // customer, item list and paid totals; never trust edited client values
        // for purchase rewards or verified-review attribution.
        const completionTimestamp = isCompleted ? (Number(oldOrder.completedAt || nextOrder.completedAt || Date.now())) : Number(nextOrder.completedAt || 0);
        completedOrderForRewards = oldSnap.exists && isCompleted
          ? { ...nextOrder, userId: oldOrder.userId, totalAmount: oldOrder.totalAmount, subtotal: oldOrder.subtotal, items: oldOrder.items, couponCode: oldOrder.couponCode || null, discountAmount: oldOrder.discountAmount || 0, completedAt: completionTimestamp }
          : (isCompleted ? { ...nextOrder, completedAt: completionTimestamp } : nextOrder);
        const userId = String(oldSnap.exists ? oldOrder.userId || '' : nextOrder.userId || '').trim();
        let userRef = null, userSnap = null, cfgSnap = null, rewardMarkerSnap = null;
        const rewardMarkerRef = userId ? db.collection('purchase_order_rewards').doc(`${userId}_${docId}`) : null;
        if (isCompleted && userId && !userId.startsWith('guest_')) {
          userRef = db.collection('users').doc(userId);
          [userSnap, cfgSnap, rewardMarkerSnap] = await Promise.all([
            tx.get(userRef), tx.get(db.collection('store_config').doc('reward_settings')),
            tx.get(rewardMarkerRef)
          ]);
        }
        let priorCustomerOrdersSnap = null;
        if (!wasCompleted && isCompleted && userRef && userSnap && !(rewardMarkerSnap && rewardMarkerSnap.exists)) {
          // Rebuild Lifetime and current Myanmar-month spend from actual orders.
          // Never trust stale cached counters when deciding whether a tier is earned.
          priorCustomerOrdersSnap = await tx.get(db.collection('orders').where('userId', '==', userId));
        }
        if (!wasCompleted && isCompleted && userRef && userSnap && !(rewardMarkerSnap && rewardMarkerSnap.exists)) {
          // Create the account reward fields if the user profile document has not been initialized yet.
          const u = userSnap.exists ? (userSnap.data() || {}) : {
            uid: userId, email: nextOrder.customerEmail || '', name: nextOrder.customerName || 'Customer'
          };
          const cfgRaw = cfgSnap && cfgSnap.exists ? (cfgSnap.data() || {}) : {};
          const cfg = cfgSnap && cfgSnap.exists ? getRewardSettings(cfgRaw) : DEFAULT_REWARD_SETTINGS;
          const tiers = cfg.lifetimeCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.purchaseTiers) ? cfg.purchaseTiers : []);
          const monthlyTiers = cfg.monthlyCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.monthlyPurchaseTiers) ? cfg.monthlyPurchaseTiers : []);
          const lifetimeTierVersion = Math.max(1, Number(cfgRaw.purchaseTiersVersion || 1));
          const monthlyTierVersion = Math.max(1, Number(cfgRaw.monthlyPurchaseTiersVersion || 1));
          const lifetimeActivatedAt = Math.max(0, Number(cfgRaw.purchaseTiersActivatedAt || 0));
          const monthlyActivatedAt = Math.max(0, Number(cfgRaw.monthlyPurchaseTiersActivatedAt || 0));
          const monthlyActivationMonthKey = String(cfgRaw.monthlyPurchaseTiersActivationMonthKey || '');
          const spend = Math.max(0, Number(completedOrderForRewards.totalAmount || 0) - Math.max(0, Number(completedOrderForRewards.refundedAmount || completedOrderForRewards.partialRefundAmount || 0)));
          const completedAtForRewards = Number(completedOrderForRewards.completedAt || Date.now());
          const currentMonthKey = myanmarMonthKey(completedAtForRewards);
          const isLifetimeTierOrder = order => !lifetimeActivatedAt || (order === completedOrderForRewards ? completedAtForRewards : Number(order.completedAt || order.createdAt || 0)) >= lifetimeActivatedAt;
          const isMonthlyTierOrder = order => !monthlyActivatedAt || monthlyActivationMonthKey !== currentMonthKey || (order === completedOrderForRewards ? completedAtForRewards : Number(order.completedAt || order.createdAt || 0)) >= monthlyActivatedAt;
          const priorOrders = priorCustomerOrdersSnap ? priorCustomerOrdersSnap.docs : [];
          const eligiblePriorOrders = priorOrders.filter(orderDoc => {
            if (orderDoc.id === docId) return false;
            const order = orderDoc.data() || {};
            const status = String(order.status || '').toLowerCase();
            return status === 'completed' && !order.refundedAt && order.refunded !== true;
          });
          const priorLifetimeSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
            const order = orderDoc.data() || {};
            const amount = Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0)));
            return sum + amount;
          }, 0);
          const totalSpend = priorLifetimeSpend + spend;
          const lifetimeTierSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
            const order = orderDoc.data() || {};
            if (!isLifetimeTierOrder(order)) return sum;
            return sum + Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0)));
          }, 0) + (isLifetimeTierOrder(completedOrderForRewards) ? spend : 0);
          const lifetimeClaimKey = tierId => lifetimeTierVersion > 1 ? `${lifetimeTierVersion}:${tierId}` : String(tierId);
          const monthlyClaimKey = (monthKey, tierId) => monthlyTierVersion > 1 ? `${monthKey}:${monthlyTierVersion}:${tierId}` : `${monthKey}:${tierId}`;
          const earnedIds = Array.isArray(u.purchaseRewardTierIds) ? u.purchaseRewardTierIds.map(String) : [];
          const newlyEarned = tiers.filter(t => Number(t.threshold || 0) > 0 && lifetimeTierSpend >= Number(t.threshold) && !earnedIds.includes(lifetimeClaimKey(String(t.id))));
          const monthlyTotalSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
            const order = orderDoc.data() || {};
            const stamp = Number(order.completedAt || order.createdAt || 0);
            if (!stamp || myanmarMonthKey(stamp) !== currentMonthKey) return sum;
            return sum + Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0)));
          }, 0) + spend;
          const monthlyTierSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
            const order = orderDoc.data() || {};
            const stamp = Number(order.completedAt || order.createdAt || 0);
            if (!stamp || myanmarMonthKey(stamp) !== currentMonthKey || !isMonthlyTierOrder(order)) return sum;
            return sum + Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0)));
          }, 0) + (isMonthlyTierOrder(completedOrderForRewards) ? spend : 0);
          const existingMonthlyEarnedKeys = Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys.map(String) : [];
          const newlyMonthlyEarned = monthlyTiers.filter(t => Number(t.threshold || 0) > 0 && monthlyTierSpend >= Number(t.threshold) && !existingMonthlyEarnedKeys.includes(monthlyClaimKey(currentMonthKey, String(t.id))));
          // Cashback caps are retired: Admin-defined Monthly and Lifetime values
          // are paid in full. Discount and review safety limits remain active.
          const cashbackTiersForOrder = [...newlyEarned.filter(t => t.rewardType === 'cashback'), ...newlyMonthlyEarned];
          const cashbackClaimRefs = cashbackTiersForOrder.map(tier => {
            const safeTierId = String(tier.id).replace(/[^A-Za-z0-9_-]/g, '_');
            const programType = newlyMonthlyEarned.includes(tier) ? 'monthly' : 'lifetime';
            const tierVersion = programType === 'monthly' ? monthlyTierVersion : lifetimeTierVersion;
            const claimId = programType === 'monthly'
              ? `${userId}_monthly_${currentMonthKey}_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ''}`
              : `${userId}_lifetime_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ''}`;
            return { tier, programType, tierVersion, claimRef: db.collection('cashback_reward_claims').doc(claimId) };
          });
          // The same deterministic claim documents are used by login reconciliation.
          // This closes the duplicate-credit race between both award paths.
          const cashbackClaimSnaps = await Promise.all(cashbackClaimRefs.map(item => tx.get(item.claimRef)));
          const claimedCashbackKeys = new Set(cashbackClaimRefs
            .filter((item, index) => cashbackClaimSnaps[index].exists)
            .map(item => `${item.programType}:${String(item.tier.id)}`));
          const cashbackCapExceeded = false;
          const cashbackSafeNewlyEarned = newlyEarned.filter(t => t.rewardType !== 'cashback' || !claimedCashbackKeys.has(`lifetime:${String(t.id)}`));
          const cashbackSafeMonthlyEarned = newlyMonthlyEarned.filter(t => !claimedCashbackKeys.has(`monthly:${String(t.id)}`));
          let cashbackBalance = Math.max(0, Number(u.cashbackBalance || 0));
          let cashbackDebt = Math.max(0, Number(u.cashbackDebt || 0));
          let cashbackTotalEarned = Math.max(0, Number(u.cashbackTotalEarned || 0));
          const cashbackHistory = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
          const rewardHistory = Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.slice() : [];
          const issuedCoupons = [];
          const issuedCouponsByTier = {};
          const earnedRewards = [];
          let cashbackCredited = 0;
          const creditCashbackTier = (t, programType, monthKey = null) => {
            const value = Math.max(0, Number(t.rewardValue || 0));
            const debtPaid = Math.min(cashbackDebt, value);
            cashbackDebt -= debtPaid;
            cashbackBalance += value - debtPaid;
            cashbackCredited += value;
            cashbackTotalEarned += value;
            const tierId = String(t.id);
            const ledgerPrefix = programType === 'monthly' ? 'earn_monthly' : 'earn';
            const rewardKey = programType === 'monthly' ? `monthly:${monthKey}:${tierId}` : `lifetime:${tierId}`;
            const tierVersion = programType === 'monthly' ? monthlyTierVersion : lifetimeTierVersion;
            const historyEntry = { id: tierId, programType, monthKey, tierVersion, threshold: Number(t.threshold), rewardType: 'cashback', rewardValue: value, orderId: docId, earnedAt: Date.now(), status: 'credited', cashbackDebtPaid: debtPaid };
            cashbackHistory.unshift({ id: `${ledgerPrefix}_${docId}_${tierId}`, type: 'earned', amount: value, creditedAmount: value - debtPaid, debtPaid, orderId: docId, programType, monthKey, createdAt: Date.now(), balanceAfter: cashbackBalance });
            const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, '_');
            tx.set(db.collection('cashback_ledger').doc(`${ledgerPrefix}_${userId}_${docId}_${safeTierId}`), { userId, orderId: docId, tierId, tierVersion, programType, monthKey, type: 'earned', amount: value, creditedAmount: value - debtPaid, debtPaid, balanceAfter: cashbackBalance, createdAt: Date.now() });
            const claimId = programType === 'monthly'
              ? `${userId}_monthly_${monthKey}_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ''}`
              : `${userId}_lifetime_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ''}`;
            tx.create(db.collection('cashback_reward_claims').doc(claimId), {
              id: claimId, userId, tierId, tierVersion, programType, monthKey, orderId: docId,
              threshold: Number(t.threshold), rewardValue: value, createdAt: Date.now(), source: 'order_completion'
            });
            rewardHistory.unshift(historyEntry);
            earnedRewards.push({ id: tierId, programType, monthKey, threshold: Number(t.threshold), rewardType: 'cashback', rewardValue: value, couponCode: null, rewardKey });
          };
          cashbackSafeNewlyEarned.forEach(t => creditCashbackTier(t, 'lifetime'));
          cashbackSafeMonthlyEarned.forEach(t => creditCashbackTier(t, 'monthly', currentMonthKey));
          const lifetimeEarnedIds = cashbackSafeNewlyEarned.map(t => lifetimeClaimKey(String(t.id)));
          const newlyMonthlyEarnedKeys = cashbackSafeMonthlyEarned.map(t => monthlyClaimKey(currentMonthKey, String(t.id)));
          tx.create(rewardMarkerRef, {
            userId, orderId: docId, totalAmount: spend, monthKey: currentMonthKey, monthlyTotalSpent: monthlyTotalSpend,
            earnedTierIds: lifetimeEarnedIds, monthlyEarnedTierKeys: newlyMonthlyEarnedKeys, cashbackCredited, issuedCoupons, earnedRewards,
            creditedAt: Date.now()
          });
          tx.create(db.collection('financial_audit_logs').doc(`purchase_reward_${crypto.createHash('sha256').update(`${userId}:${docId}`).digest('hex')}`), {
            eventType: 'purchase_reward_issued', userId, orderId: docId, totalAmount: spend,
            cashbackCredited, issuedCoupons, lifetimeTierIds: cashbackSafeNewlyEarned.map(t => String(t.id)),
            blockedCashbackTierIds: cashbackCapExceeded ? cashbackTiersForOrder.map(t => String(t.id)) : [],
            monthlyTierKeys: cashbackSafeMonthlyEarned.map(t => `${currentMonthKey}:${String(t.id)}`), createdAt: Date.now()
          });
          tx.set(userRef, {
            purchaseTotalSpent: totalSpend,
            purchaseOrderCount: Number(u.purchaseOrderCount || 0) + 1,
            monthlyPurchaseMonthKey: currentMonthKey,
            monthlyPurchaseTotalSpent: monthlyTotalSpend,
            cashbackBalance, cashbackDebt, cashbackTotalEarned, cashbackHistory: cashbackHistory.slice(0, 100),
            purchaseRewardTierIds: [...earnedIds, ...lifetimeEarnedIds],
            monthlyPurchaseRewardTierKeys: [...new Set([...(Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys : []), ...newlyMonthlyEarnedKeys])],
            purchaseRewardHistory: rewardHistory.slice(0, 100),
            updatedAt: Date.now()
          }, { merge: true });
          purchaseReward = { totalSpent: totalSpend, lifetimeTierSpend, monthlyTotalSpent: monthlyTotalSpend, monthlyTierSpend, newlyEarned: cashbackSafeNewlyEarned, newlyMonthlyEarned: cashbackSafeMonthlyEarned, blockedCashbackTierIds: cashbackCapExceeded ? cashbackTiersForOrder.map(t => String(t.id)) : [], issuedCoupons };
          cashbackSafeNewlyEarned.forEach(t => {
            const lid = `purchase_${userId}_${String(t.id).replace(/[^a-zA-Z0-9_-]/g, '_')}_${docId}`;
            tx.set(db.collection('purchase_reward_ledger').doc(lid), {
              id: lid, tierId: String(t.id), tierVersion: lifetimeTierVersion, programType: 'lifetime', userId, userEmail: u.email || '', userName: u.name || '', orderId: docId,
              threshold: Number(t.threshold), rewardType: t.rewardType === 'cashback' ? 'cashback' : 'discount',
              rewardValue: Number(t.rewardValue || 0), couponCode: issuedCouponsByTier[String(t.id)] || null, createdAt: Date.now()
            }, { merge: true });
          });
          cashbackSafeMonthlyEarned.forEach(t => {
            const safeTierId = String(t.id).replace(/[^a-zA-Z0-9_-]/g, '_');
            const lid = `monthly_purchase_${userId}_${currentMonthKey}_${safeTierId}_${docId}`;
            tx.set(db.collection('purchase_reward_ledger').doc(lid), {
              id: lid, tierId: String(t.id), tierVersion: monthlyTierVersion, programType: 'monthly', monthKey: currentMonthKey, userId, userEmail: u.email || '', userName: u.name || '', orderId: docId,
              threshold: Number(t.threshold), rewardType: 'cashback', rewardValue: Number(t.rewardValue || 0), couponCode: null, createdAt: Date.now()
            }, { merge: true });
          });
        }
        tx.set(orderRef, completedOrderForRewards, { merge: true });
      });
      // When an order becomes Completed, award any eligible pre-existing review
      // for its purchased products. A permanent customer+product claim makes this
      // safe against repeated status updates and concurrent requests.
      if (!orderWasCompleted && String(nextOrder.status || '').toLowerCase() === 'completed') {
        const completedUserId = String(completedOrderForRewards.userId || '').trim();
        const completedProductIds = [...new Set((Array.isArray(completedOrderForRewards.items) ? completedOrderForRewards.items : [])
          .map(item => String(item.id || item.productId || '').trim()).filter(Boolean))];
        if (completedUserId && !completedUserId.startsWith('guest_') && completedProductIds.length) {
          const reviewQuery = await db.collection('reviews').where('userId', '==', completedUserId).get();
          for (const reviewDoc of reviewQuery.docs) {
            const review = reviewDoc.data() || {};
            const productId = String(review.productId || '').trim();
            if (!completedProductIds.includes(productId) || review.hidden === true) continue;
            const rating = Math.min(5, Math.max(1, Number(review.rating) || 0));
            if (rating < 4 || review.pointsRewarded === true) continue;
            const claimRef = db.collection('review_reward_claims').doc(`rev_${completedUserId}_${productId}`);
            const reviewRef = reviewDoc.ref;
            const rewardUserRef = db.collection('users').doc(completedUserId);
            const cfgRef = db.collection('store_config').doc('reward_settings');
            await db.runTransaction(async tx => {
              const [orderCheck, freshReview, claim, rewardUser, cfg] = await Promise.all([
                tx.get(orderRef), tx.get(reviewRef), tx.get(claimRef), tx.get(rewardUserRef), tx.get(cfgRef)
              ]);
              if (!orderCheck.exists || String((orderCheck.data() || {}).status || '').toLowerCase() !== 'completed') return;
              const fresh = freshReview.data() || {};
              if (!freshReview.exists || fresh.hidden === true || fresh.pointsRewarded === true || claim.exists) return;
              if (String(fresh.userId || '') !== completedUserId || String(fresh.productId || '') !== productId) return;
              const orderNow = orderCheck.data() || {};
              if (isOrderRefunded(orderNow) || !Array.isArray(orderNow.items) || !orderNow.items.some(i => String(i.id || i.productId || '') === productId && Number(i.qty || 0) > 0)) return;
              const config = cfg.exists ? getRewardSettings(cfg.data()) : DEFAULT_REWARD_SETTINGS;
              const stars = Number(fresh.rating) || 0;
              let points = stars === 5 ? Number(config.points5Star ?? 0) : stars === 4 ? Number(config.points4Star ?? 0) : 0;
              const verifiedPhotos = Array.isArray(fresh.photos) ? fresh.photos.filter(url => isCustomerReviewImageUrl(url, completedUserId, productId)) : [];
              if (stars >= 4 && verifiedPhotos.length && Number(config.photoBonusPoints || 0) > 0) points += Number(config.photoBonusPoints || 0);
              const reviewSafety = normalizeFinancialSafety(config);
              if (points > reviewSafety.maxReviewPointsPerReview) {
                tx.set(db.collection('financial_audit_logs').doc(`review_reward_blocked_${completedUserId}_${productId}`), {
                  eventType: 'review_reward_blocked_by_cap', userId: completedUserId, productId, reviewId: reviewDoc.id,
                  attemptedPoints: points, allowedPoints: reviewSafety.maxReviewPointsPerReview, verifiedOrderId: docId, createdAt: Date.now()
                }, { merge: true });
                return;
              }
              if (!(points > 0)) return;
              const u = rewardUser.exists ? rewardUser.data() || {} : {};
              const before = Number(u.pointsBalance || 0), debtBefore = Math.max(0, Number(u.pointsDebt || 0));
              const debtPaid = Math.min(debtBefore, points), spendablePoints = points - debtPaid;
              const after = before + spendablePoints, debtAfter = debtBefore - debtPaid, now = Date.now();
              const ledgerId = `led_rev_${completedUserId}_${productId}`;
              tx.create(claimRef, { id: `rev_${completedUserId}_${productId}`, userId: completedUserId, productId, reviewId: reviewDoc.id, pointsAwarded: points, claimedAt: now, verifiedOrderId: docId, rule: 'one_reward_per_customer_per_product' });
              tx.set(rewardUserRef, { pointsBalance: after, pointsDebt: debtAfter, totalPointsEarned: Number(u.totalPointsEarned || 0) + points, updatedAt: now }, { merge: true });
              tx.create(db.collection('financial_audit_logs').doc(`review_reward_${completedUserId}_${productId}`), {
                eventType: 'review_points_issued', userId: completedUserId, productId, reviewId: reviewDoc.id,
                pointsAwarded: points, verifiedOrderId: docId, createdAt: now
              });
              tx.set(db.collection('points_ledger').doc(ledgerId), { id: ledgerId, userId: completedUserId, type: 'review_reward', pointsDelta: spendablePoints, grossPointsAwarded: points, pointsDebtPaid: debtPaid, pointsDebtAfter: debtAfter, balanceBefore: before, balanceAfter: after, reason: `${stars}-Star Review (${fresh.productName || productId})${verifiedPhotos.length ? ' + Photo' : ''}`, referenceId: reviewDoc.id, productId, verifiedOrderId: docId, createdAt: now });
              tx.set(reviewRef, { pointsRewarded: true, pointsAwarded: points, verifiedPurchase: true, verifiedOrderId: docId, rewardPending: false, rewardGrantedAt: now, updatedAt: now }, { merge: true });
            });
          }
        }
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, purchaseReward }) };
    }

    if (action === 'admin_refund_completed_order') {
      const orderId = String(body.orderId || '').trim();
      const reason = String(body.reason || '').trim().slice(0, 500);
      if (!orderId || !reason) throw new Error('Order ID နှင့် Refund reason လိုအပ်ပါသည်။');
      const orderRef = db.collection('orders').doc(orderId);
      const refundResult = await db.runTransaction(async (tx) => {
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) throw new Error('Order မတွေ့ပါ။');
        const order = orderSnap.data() || {};
        if (String(order.status || '').toLowerCase() === 'refunded') return { alreadyRefunded: true };
        if (String(order.status || '').toLowerCase() !== 'completed') throw new Error('Completed order မဟုတ်သောကြောင့် Refund မလုပ်နိုင်ပါ။');
        const userId = String(order.userId || '').trim();
        const userRef = userId && !userId.startsWith('guest_') ? db.collection('users').doc(userId) : null;
        const markerRef = userRef ? db.collection('purchase_order_rewards').doc(`${userId}_${orderId}`) : null;
        const claimQuery = userId && !userId.startsWith('guest_')
          ? db.collection('review_reward_claims').where('verifiedOrderId', '==', orderId) : null;
        const reviewQuery = userId && !userId.startsWith('guest_')
          ? db.collection('reviews').where('verifiedOrderId', '==', orderId) : null;
        const otherOrdersQuery = userId && !userId.startsWith('guest_')
          ? db.collection('orders').where('userId', '==', userId) : null;
        const purchaseLedgerQuery = userId && !userId.startsWith('guest_')
          ? db.collection('purchase_reward_ledger').where('userId', '==', userId) : null;
        const orderCouponCode = String(order.couponCode || '').trim().toUpperCase();
        const orderCouponRef = orderCouponCode ? db.collection('redeemed_coupons').doc(orderCouponCode) : null;
        const promoCounterRef = orderCouponCode && !/^(RWD|MS)/.test(orderCouponCode) ? db.collection('promo_coupon_counters').doc(orderCouponCode) : null;
        const promoUsageRef = promoCounterRef && userId && !userId.startsWith('guest_') ? db.collection('promo_coupon_usage').doc(crypto.createHash('sha256').update(`${orderCouponCode}:${userId}`).digest('hex')) : null;
        const [markerSnap, userSnap, claimSnap, reviewSnap, otherOrdersSnap, purchaseLedgerSnap, orderCouponSnap, cfgSnap, promoCounterSnap, promoUsageSnap] = await Promise.all([
          markerRef ? tx.get(markerRef) : Promise.resolve(null),
          userRef ? tx.get(userRef) : Promise.resolve(null),
          claimQuery ? tx.get(claimQuery) : Promise.resolve(null),
          reviewQuery ? tx.get(reviewQuery) : Promise.resolve(null),
          otherOrdersQuery ? tx.get(otherOrdersQuery) : Promise.resolve(null),
          purchaseLedgerQuery ? tx.get(purchaseLedgerQuery) : Promise.resolve(null),
          orderCouponRef ? tx.get(orderCouponRef) : Promise.resolve(null),
          tx.get(db.collection('store_config').doc('reward_settings')),
          promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null),
          promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null)
        ]);
        let sourceRefundLedgerRef = null, sourceRefundLedgerSnap = null;
        const orderCouponData = orderCouponSnap && orderCouponSnap.exists ? (orderCouponSnap.data() || {}) : null;
        const couponWasUsedOnThisOrder = Boolean(orderCouponData && orderCouponData.used === true && String(orderCouponData.usedOrderId || '') === orderId);
        const couponUsageDiscount = couponWasUsedOnThisOrder ? Math.max(0, Number(orderCouponData.usedDiscountAmount || order.discountAmount || 0)) : 0;
        if (couponWasUsedOnThisOrder && orderCouponData.revokedBySourceRefund === true && orderCouponData.sourceRefundOrderId && userId) {
          sourceRefundLedgerRef = db.collection('purchase_reward_ledger').doc(`purchase_refund_${userId}_${String(orderCouponData.sourceRefundOrderId)}`);
          sourceRefundLedgerSnap = await tx.get(sourceRefundLedgerRef);
        }
        const cfg = cfgSnap.exists ? getRewardSettings(cfgSnap.data()) : DEFAULT_REWARD_SETTINGS;
        const u = userSnap && userSnap.exists ? (userSnap.data() || {}) : {};
        let cashbackReversed = 0, tierIdsReversed = [], reviewPointsReversed = 0, reviewCountAffected = 0;
        let cashbackUpdate = null;
        if (markerSnap && markerSnap.exists) {
          const marker = markerSnap.data() || {};
          if (marker.reversedAt) throw new Error('ဤ Order ၏ Purchase Rewards ကို ပြန်လည်ရုပ်သိမ်းပြီးသားဖြစ်ပါသည်။');
          const refundedSpend = Math.max(0, Number(marker.totalAmount || order.totalAmount || 0));
          const netSpendAfterRefund = Math.max(0, Number(u.purchaseTotalSpent || 0) - refundedSpend);
          const refundedMonthKey = myanmarMonthKey(order.completedAt || order.createdAt || 0);
          const monthlySpendAfterRefund = (otherOrdersSnap ? otherOrdersSnap.docs : []).reduce((sum, orderDoc) => {
            if (orderDoc.id === orderId) return sum;
            const other = orderDoc.data() || {};
            if (String(other.status || '').toLowerCase() !== 'completed' || other.refundedAt || other.refunded === true) return sum;
            if (myanmarMonthKey(other.completedAt || other.createdAt || 0) !== refundedMonthKey) return sum;
            return sum + Math.max(0, Number(other.totalAmount || 0) - Math.max(0, Number(other.refundedAmount || other.partialRefundAmount || 0)));
          }, 0);
          const purchaseLedgerDocs = purchaseLedgerSnap ? purchaseLedgerSnap.docs : [];
          const activeRewardDocs = purchaseLedgerDocs.filter(doc => {
            const reward = doc.data() || {};
            if (reward.type === 'refund_reversal' || reward.reversedAt) return false;
            const stillQualifies = reward.programType === 'monthly'
              ? (String(reward.monthKey || '') !== refundedMonthKey || monthlySpendAfterRefund >= Number(reward.threshold || 0))
              : netSpendAfterRefund >= Number(reward.threshold || 0);
            return !stillQualifies;
          });
          const legacyLedgerAvailable = purchaseLedgerDocs.some(doc => (doc.data() || {}).type !== 'refund_reversal');
          const rewardsToReverse = legacyLedgerAvailable
            ? activeRewardDocs.map(doc => ({ ref: doc.ref, ...(doc.data() || {}) }))
            : (Array.isArray(marker.earnedRewards) && marker.earnedRewards.length
              ? marker.earnedRewards.filter(reward => reward.programType === 'monthly' ? monthlySpendAfterRefund < Number(reward.threshold || 0) : netSpendAfterRefund < Number(reward.threshold || 0))
              : (Array.isArray(marker.earnedTierIds) ? marker.earnedTierIds.map(id => ({ id: String(id), programType: 'lifetime', rewardType: 'cashback', rewardValue: 0, couponCode: null })) : []));
          tierIdsReversed = rewardsToReverse.map(reward => reward.programType === 'monthly' ? `monthly:${String(reward.monthKey || refundedMonthKey)}:${String(reward.tierId || reward.id || '')}` : String(reward.tierId || reward.id || ''));
          cashbackReversed = legacyLedgerAvailable
            ? rewardsToReverse.reduce((sum, reward) => sum + (reward.rewardType === 'cashback' ? Math.max(0, Number(reward.rewardValue || 0)) : 0), 0)
            : Math.max(0, Number(marker.cashbackCredited || 0));
          const currentCashback = Math.max(0, Number(u.cashbackBalance || 0));
          const cashbackBalanceUsed = Math.min(currentCashback, cashbackReversed);
          const cashbackDebtAdded = cashbackReversed - cashbackBalanceUsed;
          const nextCashbackDebt = Math.max(0, Number(u.cashbackDebt || 0)) + cashbackDebtAdded;
          const couponCodes = legacyLedgerAvailable
            ? rewardsToReverse.map(reward => String(reward.couponCode || '')).filter(Boolean)
            : (Array.isArray(marker.issuedCoupons) ? marker.issuedCoupons.map(String) : []);
          const couponRefs = couponCodes.map(code => db.collection('redeemed_coupons').doc(code));
          const couponSnaps = await Promise.all(couponRefs.map(ref => tx.get(ref)));
          const usedOrderIds = couponSnaps.map(snap => snap.exists && (snap.data() || {}).used === true ? String((snap.data() || {}).usedOrderId || '') : '').filter(Boolean);
          const uniqueUsedOrderIds = [...new Set(usedOrderIds)];
          const usedOrderSnaps = await Promise.all(uniqueUsedOrderIds.map(id => tx.get(db.collection('orders').doc(id))));
          const usedOrderRefundedById = new Map(uniqueUsedOrderIds.map((id, idx) => [id, Boolean(usedOrderSnaps[idx].exists && String((usedOrderSnaps[idx].data() || {}).status || '').toLowerCase() === 'refunded')]));
          const couponReversals = [];
          couponSnaps.forEach((couponSnap, idx) => {
            if (!couponSnap.exists) return;
            const coupon = couponSnap.data() || {};
            const couponCode = couponCodes[idx];
            if (coupon.used === true) {
              const usedOrderId = String(coupon.usedOrderId || '');
              const usedOrderRefunded = Boolean(usedOrderRefundedById.get(usedOrderId));
              const usedDiscount = usedOrderRefunded ? 0 : Math.max(0, Number(coupon.usedDiscountAmount || 0));
              couponReversals.push({ code: couponCode, used: true, usedOrderId: coupon.usedOrderId || null, usedOrderRefunded, debtAdded: usedDiscount });
              tx.set(couponRefs[idx], { revokedBySourceRefund: true, sourceRefundedAt: Date.now(), sourceRefundOrderId: orderId }, { merge: true });
            } else {
              tx.set(couponRefs[idx], { revoked: true, revokedAt: Date.now(), revokedReason: `Source order ${orderId} refunded` }, { merge: true });
              couponReversals.push({ code: couponCode, used: false, debtAdded: 0 });
            }
          });
          const couponDebtAdded = couponReversals.reduce((sum, c) => sum + Number(c.debtAdded || 0), 0);
          const currentTierIds = Array.isArray(u.purchaseRewardTierIds) ? u.purchaseRewardTierIds.map(String) : [];
          const currentMonthlyKeys = Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys.map(String) : [];
          const reversedLifetimeIds = new Set(rewardsToReverse.filter(r => r.programType !== 'monthly').map(r => String(r.tierId || r.id || '')));
          const reversedMonthlyKeys = new Set(rewardsToReverse.filter(r => r.programType === 'monthly').map(r => `${String(r.monthKey || refundedMonthKey)}:${String(r.tierId || r.id || '')}`));
          const history = Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.map(item => {
            const isMonthly = item.programType === 'monthly';
            const key = isMonthly ? `${String(item.monthKey || '')}:${String(item.id || '')}` : String(item.id || '');
            return (isMonthly ? reversedMonthlyKeys.has(key) : reversedLifetimeIds.has(key))
              ? { ...item, status: 'reversed', reversedAt: Date.now(), reversalReason: reason }
              : item;
          }) : [];
          for (const reward of rewardsToReverse) {
            if (reward.ref) tx.set(reward.ref, { reversedAt: Date.now(), reversedBy: adminUid, reversalOrderId: orderId, reversalReason: reason }, { merge: true });
          }
          const cashbackHistory = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
          const cashbackReversalEntries = rewardsToReverse.filter(reward => reward.rewardType === 'cashback').map(reward => {
            const amount = Math.max(0, Number(reward.rewardValue || 0));
            const tierId = String(reward.tierId || reward.id || '');
            const programType = reward.programType === 'monthly' ? 'monthly' : 'lifetime';
            const monthKey = programType === 'monthly' ? String(reward.monthKey || refundedMonthKey) : null;
            const sourceOrderId = String(reward.orderId || orderId);
            const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, '_');
            const reversalId = `refund_${orderId}_${programType}_${sourceOrderId}_${safeTierId}`;
            tx.set(db.collection('cashback_ledger').doc(reversalId), {
              id: reversalId, userId, orderId: sourceOrderId, refundOrderId: orderId, tierId, programType, monthKey,
              type: 'refund_reversal', amount, balanceAfter: Math.max(0, currentCashback - cashbackBalanceUsed), debtAfter: nextCashbackDebt, createdAt: Date.now(), reason,
              reversalOf: `${programType === 'monthly' ? 'earn_monthly' : 'earn'}_${userId}_${sourceOrderId}_${safeTierId}`
            });
            return { id: reversalId, type: 'refund_reversal', amount, orderId: sourceOrderId, refundOrderId: orderId, programType, monthKey, createdAt: Date.now(), reason };
          });
          cashbackHistory.unshift(...cashbackReversalEntries);
          cashbackUpdate = {
            purchaseTotalSpent: netSpendAfterRefund,
            purchaseOrderCount: Math.max(0, Number(u.purchaseOrderCount || 0) - 1),
            cashbackBalance: currentCashback - cashbackBalanceUsed,
            cashbackDebt: nextCashbackDebt + couponDebtAdded,
            cashbackTotalEarned: Math.max(0, Math.max(Number(u.cashbackTotalEarned || 0), Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.filter(item => item.rewardType === 'cashback' && item.status !== 'reversed').reduce((sum, item) => sum + Math.max(0, Number(item.rewardValue || 0)), 0) : 0) - cashbackReversed),
            cashbackHistory: cashbackHistory.slice(0, 100),
            purchaseRewardTierIds: currentTierIds.filter(id => !reversedLifetimeIds.has(id)),
            monthlyPurchaseRewardTierKeys: currentMonthlyKeys.filter(key => !reversedMonthlyKeys.has(key)),
            ...(String(u.monthlyPurchaseMonthKey || '') === refundedMonthKey ? { monthlyPurchaseTotalSpent: monthlySpendAfterRefund } : {}),
            purchaseRewardHistory: history
          };
          tx.set(markerRef, { reversedAt: Date.now(), reversedBy: adminUid, reversalReason: reason }, { merge: true });
          const reversalId = `purchase_refund_${userId}_${orderId}`;
          tx.set(db.collection('purchase_reward_ledger').doc(reversalId), {
            id: reversalId, userId, orderId, type: 'refund_reversal',
            cashbackReversed, cashbackDebtAdded, couponDebtAdded, couponReversals, tierIdsReversed, reason, adminUid, adminEmail, createdAt: Date.now()
          });
        }

        const pointsUsedOnOrder = Math.max(0, Number(order.pointsUsed || 0));
        if (pointsUsedOnOrder > 0 && userRef && !order.pointsRestoredAt) {
          const currentPoints = Math.max(0, Number(u.pointsBalance || 0));
          const restoredPoints = currentPoints + pointsUsedOnOrder;
          const history = Array.isArray(u.pointsHistory) ? u.pointsHistory.slice() : [];
          history.unshift({ id: `refund_restore_${orderId}`, type: 'refund_restore', points: pointsUsedOnOrder, orderId, createdAt: Date.now(), balanceAfter: restoredPoints });
          cashbackUpdate = { ...(cashbackUpdate || {}), pointsBalance: restoredPoints, pointsTotalUsed: Math.max(0, Number(u.pointsTotalUsed || 0) - pointsUsedOnOrder), pointsHistory: history.slice(0, 100) };
          tx.set(db.collection('points_ledger').doc(`refund_restore_${orderId}`), { id: `refund_restore_${orderId}`, userId, orderId, type: 'checkout_refund_restore', pointsDelta: pointsUsedOnOrder, balanceBefore: currentPoints, balanceAfter: restoredPoints, reason: 'Refund Order အတွက် Checkout Points ပြန်အမ်း', createdAt: Date.now() });
        }
        const cashbackUsedOnOrder = Math.max(0, Number(order.cashbackUsed || 0));
        if (cashbackUsedOnOrder > 0 && userRef && !order.cashbackRestoredAt) {
          const baseBalance = cashbackUpdate ? Math.max(0, Number(cashbackUpdate.cashbackBalance || 0)) : Math.max(0, Number(u.cashbackBalance || 0));
          const restoredBalance = baseBalance + cashbackUsedOnOrder;
          const baseUsedTotal = cashbackUpdate ? Math.max(0, Number(u.cashbackTotalUsed || 0)) : Math.max(0, Number(u.cashbackTotalUsed || 0));
          const history = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
          history.unshift({ id: `refund_restore_${orderId}`, type: 'refund_restore', amount: cashbackUsedOnOrder, orderId, createdAt: Date.now(), balanceAfter: restoredBalance });
          cashbackUpdate = { ...(cashbackUpdate || {}), cashbackBalance: restoredBalance, cashbackTotalUsed: Math.max(0, baseUsedTotal - cashbackUsedOnOrder), cashbackHistory: history.slice(0, 100) };
          tx.set(db.collection('cashback_ledger').doc(`refund_restore_${orderId}`), { id: `refund_restore_${orderId}`, userId, orderId, type: 'refund_restore', amount: cashbackUsedOnOrder, balanceBefore: baseBalance, balanceAfter: restoredBalance, createdAt: Date.now() });
        }

        let couponDebtReversed = 0;
        if (couponWasUsedOnThisOrder && orderCouponRef) {
          if (orderCouponData.revokedBySourceRefund === true) {
            const currentDebt = Math.max(0, Number(u.cashbackDebt || 0));
            const alreadyReversed = Boolean(orderCouponData.sourceRefundDebtReversedAt);
            if (!alreadyReversed && sourceRefundLedgerSnap && sourceRefundLedgerSnap.exists) {
              couponDebtReversed = Math.min(currentDebt, couponUsageDiscount);
              tx.set(orderCouponRef, { sourceRefundDebtReversedAt: Date.now(), usedOrderRefundedAt: Date.now() }, { merge: true });
              const sourceLedger = sourceRefundLedgerSnap.data() || {};
              const updatedCouponReversals = Array.isArray(sourceLedger.couponReversals) ? sourceLedger.couponReversals.map(entry =>
                String(entry.code || '') === orderCouponCode ? { ...entry, debtAdded: 0, usedOrderRefunded: true, debtReversedAt: Date.now() } : entry
              ) : [];
              tx.set(sourceRefundLedgerRef, {
                couponDebtAdded: Math.max(0, Number(sourceLedger.couponDebtAdded || 0) - couponDebtReversed),
                couponUseRefundedOrderAt: Date.now(), couponReversals: updatedCouponReversals
              }, { merge: true });
            }
          } else {
            tx.set(orderCouponRef, { used: false, usedAt: null, usedOrderId: null, usedDiscountAmount: 0, usageRestoredAt: Date.now(), usageRestoredReason: `Order ${orderId} refunded` }, { merge: true });
          }
        }
        if (couponDebtReversed > 0 && userRef) {
          const nextDebt = Math.max(0, Number(u.cashbackDebt || 0) - couponDebtReversed);
          if (cashbackUpdate) cashbackUpdate.cashbackDebt = Math.max(0, Number(cashbackUpdate.cashbackDebt || 0) - couponDebtReversed);
          else tx.set(userRef, { cashbackDebt: nextDebt, updatedAt: Date.now() }, { merge: true });
        }

        const claimDocs = claimSnap ? claimSnap.docs : [];
        const reviewDocs = reviewSnap ? reviewSnap.docs : [];
        const remainingPurchaseByProduct = new Map();
        for (const otherDoc of (otherOrdersSnap ? otherOrdersSnap.docs : [])) {
          if (otherDoc.id === orderId) continue;
          const other = otherDoc.data() || {};
          if (String(other.status || '').toLowerCase() !== 'completed' || isOrderRefunded(other)) continue;
          for (const item of (Array.isArray(other.items) ? other.items : [])) {
            const pid = String(item.id || item.productId || '').trim();
            if (pid && Number(item.qty || 0) > 0 && !remainingPurchaseByProduct.has(pid)) remainingPurchaseByProduct.set(pid, otherDoc.id);
          }
        }
        const reviewByProduct = new Map();
        for (const d of reviewDocs) {
          const r = d.data() || {};
          reviewByProduct.set(String(r.productId || ''), { reviewRef: d.ref, reviewId: d.id, review: r });
        }
        const claimsToReverse = [];
        for (const d of claimDocs) {
          const c = d.data() || {};
          const productId = String(c.productId || '');
          if (c.reversedAt || !(Number(c.pointsAwarded || 0) > 0) || remainingPurchaseByProduct.has(productId)) continue;
          claimsToReverse.push({ ref: d.ref, claim: c, productId });
        }
        if (cfg.reverseReviewPointsOnRefund !== false) {
          for (const [productId, item] of reviewByProduct.entries()) {
            if (!remainingPurchaseByProduct.has(productId) && item.review.pointsRewarded === true && Number(item.review.pointsAwarded || 0) > 0 && !item.review.pointsReversedAt && !claimsToReverse.some(x => x.productId === productId)) {
              claimsToReverse.push({ ref: db.collection('review_reward_claims').doc(`rev_${userId}_${productId}`), claim: { pointsAwarded: Number(item.review.pointsAwarded || 0), userId, productId, reviewId: item.reviewId, verifiedOrderId: orderId }, productId, legacyReview: item });
            }
          }
          reviewPointsReversed = claimsToReverse.reduce((sum, x) => sum + Math.max(0, Number(x.claim.pointsAwarded || 0)), 0);
        }

        let pointsBalanceAfter = Number(u.pointsBalance || 0);
        let pointsDebtAfter = Math.max(0, Number(u.pointsDebt || 0));
        if (reviewPointsReversed > 0 && userRef) {
          const currentBalance = Math.max(0, Number(u.pointsBalance || 0)) + (pointsUsedOnOrder > 0 && !order.pointsRestoredAt ? pointsUsedOnOrder : 0);
          const balanceUsed = Math.min(currentBalance, reviewPointsReversed);
          const debtAdded = reviewPointsReversed - balanceUsed;
          pointsBalanceAfter = currentBalance - balanceUsed;
          pointsDebtAfter += debtAdded;
          const now = Date.now();
          tx.set(userRef, { ...(cashbackUpdate || {}), pointsBalance: pointsBalanceAfter, pointsDebt: pointsDebtAfter, updatedAt: now }, { merge: true });
          const reversalId = `review_refund_${userId}_${orderId}`;
          tx.set(db.collection('points_ledger').doc(reversalId), {
            id: reversalId, userId, type: 'review_reward_refund', pointsDelta: -balanceUsed,
            pointsReversed: reviewPointsReversed, debtAdded, balanceBefore: currentBalance,
            balanceAfter: pointsBalanceAfter, pointsDebtAfter, orderId, reason: `Refund reversal: ${reason}`,
            adminUid, adminEmail, createdAt: now
          });
          for (const entry of claimsToReverse) {
            tx.set(entry.ref, { reversedAt: now, reversedBy: adminUid, reversalOrderId: orderId, reversalReason: reason, pointsReversed: Number(entry.claim.pointsAwarded || 0) }, { merge: true });
          }
        } else if (cashbackUpdate && userRef) {
          tx.set(userRef, { ...cashbackUpdate, updatedAt: Date.now() }, { merge: true });
        }
        // Remove the verified-purchase link for every review associated with this
        // refunded order, including low-star reviews that never earned points.
        const keepReviews = cfg.keepReviewAfterRefund !== false;
        const reversedProductIds = new Set(claimsToReverse.map(x => x.productId));
        const reviewProductIdsAffected = [];
        for (const [productId, item] of reviewByProduct.entries()) {
          reviewCountAffected++;
          reviewProductIdsAffected.push(productId);
          const alternateOrderId = remainingPurchaseByProduct.get(productId) || null;
          const wasReversed = !alternateOrderId && cfg.reverseReviewPointsOnRefund !== false && reversedProductIds.has(productId);
          tx.set(item.reviewRef, {
            ...(wasReversed ? { pointsRewarded: false, pointsAwarded: 0, pointsReversedAt: Date.now() } : {}),
            verifiedPurchase: Boolean(alternateOrderId), verifiedOrderId: alternateOrderId, rewardPending: false,
            hidden: alternateOrderId ? Boolean(item.review.hidden) : (keepReviews ? Boolean(item.review.hidden) : true),
            refundReviewAction: alternateOrderId ? 'verified_by_another_completed_order' : (wasReversed ? (keepReviews ? 'kept_unverified' : 'hidden_after_refund') : (keepReviews ? 'kept_unverified_points_retained' : 'hidden_points_retained')),
            updatedAt: Date.now()
          }, { merge: true });
        }
        const promoUsageRestored = restorePromoCouponUsageInTransaction(tx, db, orderCouponCode, userId, orderId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef);
        tx.create(db.collection('financial_audit_logs').doc(`refund_${orderId}`), {
          eventType: 'completed_order_refunded', userId, orderId, reason, adminUid, adminEmail,
          cashbackReversed, reviewPointsReversed, couponCode: orderCouponCode || null,
          couponUsageDiscount: couponWasUsedOnThisOrder ? couponUsageDiscount : 0, promoUsageRestored, createdAt: Date.now()
        });
        tx.set(orderRef, { status: 'refunded', refundedAt: Date.now(), refundReason: reason, refundedBy: adminUid, ...(cashbackUsedOnOrder > 0 ? { cashbackRestoredAt: Date.now() } : {}), ...(pointsUsedOnOrder > 0 ? { pointsRestoredAt: Date.now() } : {}), updatedAt: Date.now() }, { merge: true });
        return {
          alreadyRefunded: false,
          reviewProductIdsAffected,
          reversal: { promoUsageRestored, cashbackReversed, cashbackDebtAdded: Math.max(0, Number(u.cashbackDebt || 0)) + cashbackDebtAdded, couponDebtAdded, couponDebtReversed, couponUsageRestored: couponWasUsedOnThisOrder && orderCouponData.revokedBySourceRefund !== true, tierIdsReversed, reviewPointsReversed, reviewCountAffected, pointsBalanceAfter, pointsDebtAfter }
        };
      });
      if (!refundResult.alreadyRefunded && Array.isArray(refundResult.reviewProductIdsAffected)) {
        for (const productId of refundResult.reviewProductIdsAffected) await syncProductVisibleReviews(db, productId);
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, orderId, ...refundResult }) };
    }

    if (action === 'admin_cancel_pending_order' || action === 'delete_order') {
      const docId = String(body.orderId || body.id || '').trim();
      if (!docId) throw new Error('Order ID လိုအပ်ပါသည်။');
      const orderRef = db.collection('orders').doc(docId);
      const cancelResult = await db.runTransaction(async tx => {
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) throw new Error('Order မတွေ့ပါ။');
        const order = orderSnap.data() || {};
        const status = String(order.status || '').toLowerCase();
        if (status === 'cancelled' || status === 'canceled') return { alreadyCancelled: true };
        if (!['pending', 'processing', 'shipped', 'failed'].includes(status)) throw new Error('ဤ Order အခြေအနေကို Cancel မလုပ်နိုင်ပါ။ Completed Order အတွက် Refund ကို အသုံးပြုပါ။');
        const items = Array.isArray(order.items) ? order.items : [];
        const productRefs = [...new Set(items.map(x => String(x.id || '')).filter(Boolean))].map(id => db.collection('products').doc(id));
        const userId = String(order.userId || '');
        const userRef = userId && !userId.startsWith('guest_') ? db.collection('users').doc(userId) : null;
        const couponCode = String(order.couponCode || '').trim().toUpperCase();
        const couponRef = couponCode ? db.collection('redeemed_coupons').doc(couponCode) : null;
        const promoCounterRef = couponCode && !/^(RWD|MS)/.test(couponCode) ? db.collection('promo_coupon_counters').doc(couponCode) : null;
        const promoUsageRef = promoCounterRef && userId && !userId.startsWith('guest_') ? db.collection('promo_coupon_usage').doc(crypto.createHash('sha256').update(`${couponCode}:${userId}`).digest('hex')) : null;
        const [productSnaps, userSnap, couponSnap, promoCounterSnap, promoUsageSnap] = await Promise.all([
          Promise.all(productRefs.map(ref => tx.get(ref))),
          userRef ? tx.get(userRef) : Promise.resolve(null),
          couponRef ? tx.get(couponRef) : Promise.resolve(null),
          promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null),
          promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null)
        ]);
        const now = Date.now();
        productSnaps.forEach((snap, idx) => {
          if (!snap.exists) return;
          const id = productRefs[idx].id;
          const qty = items.filter(x => String(x.id || '') === id).reduce((n, x) => n + Math.max(0, Math.floor(Number(x.qty || 0))), 0);
          if (qty > 0) tx.update(productRefs[idx], { stock: Math.max(0, Number((snap.data() || {}).stock || 0)) + qty, updatedAt: now });
        });
        let cashbackRestored = 0, pointsRestored = 0;
        if (userRef && userSnap && userSnap.exists) {
          const u = userSnap.data() || {};
          const cashbackUsed = Math.max(0, Number(order.cashbackUsed || 0));
          const pointsUsed = Math.max(0, Number(order.pointsUsed || 0));
          const nextCashback = Math.max(0, Number(u.cashbackBalance || 0)) + cashbackUsed;
          const nextPoints = Math.max(0, Number(u.pointsBalance || 0)) + pointsUsed;
          cashbackRestored = cashbackUsed; pointsRestored = pointsUsed;
          const updates = { updatedAt: now };
          if (cashbackUsed > 0) {
            updates.cashbackBalance = nextCashback;
            updates.cashbackTotalUsed = Math.max(0, Number(u.cashbackTotalUsed || 0) - cashbackUsed);
            const h = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
            h.unshift({ id: `cancel_restore_${docId}`, type: 'cancel_restore', amount: cashbackUsed, orderId: docId, createdAt: now, balanceAfter: nextCashback });
            updates.cashbackHistory = h.slice(0, 100);
            tx.create(db.collection('cashback_ledger').doc(`cancel_restore_${docId}`), { id: `cancel_restore_${docId}`, userId, orderId: docId, type: 'cancel_restore', amount: cashbackUsed, balanceAfter: nextCashback, createdAt: now });
          }
          if (pointsUsed > 0) {
            updates.pointsBalance = nextPoints;
            updates.pointsTotalUsed = Math.max(0, Number(u.pointsTotalUsed || 0) - pointsUsed);
            tx.create(db.collection('points_ledger').doc(`cancel_restore_${docId}`), { id: `cancel_restore_${docId}`, userId, orderId: docId, type: 'checkout_cancel_restore', pointsDelta: pointsUsed, balanceBefore: Number(u.pointsBalance || 0), balanceAfter: nextPoints, reason: 'Cancelled Order အတွက် Points ပြန်အမ်း', createdAt: now });
          }
          tx.set(userRef, updates, { merge: true });
        }
        if (couponRef && couponSnap && couponSnap.exists) {
          const c = couponSnap.data() || {};
          if (c.used === true && String(c.usedOrderId || '') === docId) tx.set(couponRef, { used: false, usedAt: null, usedOrderId: null, usedDiscountAmount: 0, usageRestoredAt: now, usageRestoredReason: 'Order cancelled' }, { merge: true });
        }
        const promoUsageRestored = restorePromoCouponUsageInTransaction(tx, db, couponCode, userId, docId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef);
        tx.create(db.collection('financial_audit_logs').doc(`cancel_${docId}`), {
          eventType: 'pending_order_cancelled', userId, orderId: docId, adminUid, adminEmail,
          cashbackRestored, pointsRestored, promoUsageRestored, stockRestored: true, createdAt: now
        });
        tx.set(orderRef, { status: 'cancelled', cancelledAt: now, cancelledBy: adminUid, cancellationReason: String(body.reason || 'Admin cancelled pending order').slice(0, 300), cashbackRestoredAt: cashbackRestored ? now : null, pointsRestoredAt: pointsRestored ? now : null, stockRestoredAt: now, updatedAt: now }, { merge: true });
        return { alreadyCancelled: false, cashbackRestored, pointsRestored, promoUsageRestored, stockRestored: true };
      });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, ...cancelResult }) };
    }

    if (action === 'save_promo') {
      const promo = body.promo;
      if (!promo || !promo.id) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing promo data.' }) };
      }
      const docId = String(promo.id);
      await db.collection('promos').doc(docId).set({ ...promo, id: docId, updatedAt: Date.now() }, { merge: true });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
    }

    if (action === 'delete_promo') {
      const docId = String(body.id || '');
      if (docId) await db.collection('promos').doc(docId).delete();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
    }

    if (action === 'save_store_config') {
      const docId = String(body.docId || '');
      const payload = body.data || {};
      if (!docId) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Missing docId.' }) };
      }
      await db.collection('store_config').doc(docId).set({ ...payload, updatedAt: Date.now() }, { merge: true });
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, docId }) };
    }

    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: `Unknown action: ${action}` })
    };
  } catch (err) {
    console.error('store-data error:', err.message);
    return {
      statusCode: 403,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err.message || 'Server store-data operation failed.'
      })
    };
  }
};


export async function onRequest(context) {
  const { request, env } = context;
  currentEnv = env || {};
  initFirebaseAdmin();
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  const rawBody = await request.text().catch(() => '');
  const event = {
    httpMethod: request.method,
    headers: {
      authorization: authHeader,
      Authorization: authHeader
    },
    body: rawBody
  };
  const res = await exports.handler(event);
  return new Response(res.body || '', {
    status: res.statusCode || 200,
    headers: res.headers || JSON_HEADERS
  });
}
