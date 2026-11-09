const {
  JSON_HEADERS, admin, initFirebaseAdmin, normalizeEmail, resolveServerRole
} = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Login လုပ်ပြီးမှ ပုံတင်နိုင်ပါသည်။' }) };
    initFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    const db = admin.firestore();
    const body = JSON.parse(event.body || '{}');
    const purpose = String(body.purpose || '');
    // Firestore-backed per-user upload throttling. The transaction prevents
    // concurrent requests from bypassing the window counter.
    const now = Date.now();
    const limitKey = `${decoded.uid}_${purpose}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);
    const limitRef = db.collection('image_upload_rate_limits').doc(limitKey);
    const maxUploads = purpose === 'admin_asset' ? 30 : 20;
    await db.runTransaction(async tx => {
      const snap = await tx.get(limitRef);
      const current = snap.exists ? snap.data() || {} : {};
      const windowStart = Number(current.windowStart || 0);
      const active = windowStart > 0 && now - windowStart < 10 * 60 * 1000;
      const count = active ? Math.max(0, Number(current.count) || 0) : 0;
      if (count >= maxUploads) throw new Error('ပုံတင်မှု အကြိမ်ရေ ကန့်သတ်ချက် ပြည့်သွားပါပြီ။ ၁၀ မိနစ်အကြာ ပြန်ကြိုးစားပါ။');
      tx.set(limitRef, { uid: decoded.uid, purpose, windowStart: active ? windowStart : now, count: count + 1, updatedAt: now });
    });
    const mimeType = String(body.mimeType || '').toLowerCase();
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMime.includes(mimeType)) throw new Error('JPEG, PNG, WebP ပုံဖိုင်များသာ တင်နိုင်ပါသည်။');
    const base64 = String(body.fileBase64 || '').replace(/^data:[^,]+,/, '');
    if (!base64 || base64.length > 5_600_000) throw new Error('ပုံဖိုင်အရွယ်အစား 4MB ထက် မကျော်ရပါ။');
    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length || bytes.length > 4 * 1024 * 1024) throw new Error('ပုံဖိုင်အရွယ်အစား 4MB ထက် မကျော်ရပါ။');
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
    const isWebp = bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!(isJpeg || isPng || isWebp)) throw new Error('ပုံဖိုင်အမျိုးအစားကို အတည်မပြုနိုင်ပါ။ JPEG, PNG, WebP သာ တင်နိုင်ပါသည်။');
    const actualMime = isJpeg ? 'image/jpeg' : isPng ? 'image/png' : 'image/webp';
    if (actualMime !== mimeType) throw new Error('ပုံဖိုင် MIME Type နှင့် File Content မကိုက်ညီပါ။');
    const fileName = String(body.fileName || `dd-fashion-${Date.now()}.jpg`).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100);
    const isAdminAsset = purpose === 'admin_asset';
    let folder = '';
    if (purpose === 'customer_upload') {
      const productId = String(body.productId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 100);
      if (!productId) throw new Error('Review ပုံအတွက် Product ID လိုအပ်ပါသည်။');
      folder = `/production/reviews/${decoded.uid}/${productId}`;
    } else if (isAdminAsset) {
      const userSnap = await db.collection('users').doc(decoded.uid).get();
      const profileRole = userSnap.exists ? String((userSnap.data() || {}).role || '') : '';
      const role = ['admin_master', 'admin_staff'].includes(profileRole) ? profileRole : 'customer';
      if (!['admin_master', 'admin_staff'].includes(role)) throw new Error('Admin ခွင့်ပြုချက်လိုအပ်ပါသည်။');
      const assetType = String(body.assetType || 'products');
      const allowedFolders = { products: 'products', promotions: 'promotions', 'payment-qr': 'payment-qr' };
      if (!allowedFolders[assetType]) throw new Error('Upload folder မမှန်ကန်ပါ။');
      folder = `/production/${allowedFolders[assetType]}`;
    } else throw new Error('Upload purpose မမှန်ကန်ပါ။');

    const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
    if (!privateKey || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) throw new Error('ImageKit Environment Variables မပြည့်စုံပါ။');
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: actualMime }), fileName);
    form.append('fileName', fileName);
    form.append('folder', folder);
    form.append('useUniqueFileName', 'true');
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}` }, body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.message || `ImageKit upload failed (${response.status})`);
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, url: data.url, fileId: data.fileId, folder }) };
  } catch (error) {
    console.error('imagekit-upload error:', error.message);
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: error.message || 'Image upload failed.' }) };
  }
};
