import {
  JSON_HEADERS,
  jsonResponse,
  verifyFirebaseIdToken,
  getFirestoreDocument,
  runFirestoreTransaction,
  firestoreUpdateWrite
} from '../../cloudflare/firebase-rest.js';

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== 'POST') return jsonResponse(405, { ok: false, error: 'Method Not Allowed' });

  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return jsonResponse(401, { ok: false, error: 'Login လုပ်ပြီးမှ ပုံတင်နိုင်ပါသည်။' });

    const decoded = await verifyFirebaseIdToken(token, env);
    const uid = decoded.sub;
    const body = await request.json().catch(() => ({}));
    const purpose = String(body.purpose || '');

    // Firestore-backed per-user upload throttling. The transaction prevents
    // concurrent requests from bypassing the window counter.
    const now = Date.now();
    const limitKey = `${uid}_${purpose}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);
    const maxUploads = purpose === 'admin_asset' ? 30 : 20;

    await runFirestoreTransaction(env, [{ collection: 'image_upload_rate_limits', id: limitKey }], ([snap]) => {
      const current = snap.exists ? (snap.data || {}) : {};
      const windowStart = Number(current.windowStart || 0);
      const active = windowStart > 0 && now - windowStart < 10 * 60 * 1000;
      const count = active ? Math.max(0, Number(current.count) || 0) : 0;
      if (count >= maxUploads) {
        throw new Error('ပုံတင်မှု အကြိမ်ရေ ကန့်သတ်ချက် ပြည့်သွားပါပြီ။ ၁၀ မိနစ်အကြာ ပြန်ကြိုးစားပါ။');
      }
      return {
        writes: [
          firestoreUpdateWrite('image_upload_rate_limits', limitKey, {
            uid,
            purpose,
            windowStart: active ? windowStart : now,
            count: count + 1,
            updatedAt: now
          }, { projectId: env.FIREBASE_PROJECT_ID, exists: snap.exists })
        ],
        result: true
      };
    });

    const mimeType = String(body.mimeType || '').toLowerCase();
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMime.includes(mimeType)) throw new Error('JPEG, PNG, WebP ပုံဖိုင်များသာ တင်နိုင်ပါသည်။');

    const base64 = String(body.fileBase64 || '').replace(/^data:[^,]+,/, '');
    if (!base64 || base64.length > 5_600_000) throw new Error('ပုံဖိုင်အရွယ်အစား 4MB ထက် မကျော်ရပါ။');

    const bytes = base64ToUint8Array(base64);
    if (!bytes.length || bytes.length > 4 * 1024 * 1024) throw new Error('ပုံဖိုင်အရွယ်အစား 4MB ထက် မကျော်ရပါ။');

    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length > 8 && pngSig.every((b, idx) => bytes[idx] === b);
    const isWebp = bytes.length > 12 &&
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF' &&
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'WEBP';

    if (!(isJpeg || isPng || isWebp)) throw new Error('ပုံဖိုင်အမျိုးအစားကို အတည်မပြုနိုင်ပါ။ JPEG, PNG, WebP သာ တင်နိုင်ပါသည်။');
    const actualMime = isJpeg ? 'image/jpeg' : isPng ? 'image/png' : 'image/webp';
    if (actualMime !== mimeType) throw new Error('ပုံဖိုင် MIME Type နှင့် File Content မကိုက်ညီပါ။');

    const fileName = String(body.fileName || `dd-fashion-${Date.now()}.jpg`).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100);
    const isAdminAsset = purpose === 'admin_asset';
    let folder = '';

    if (purpose === 'customer_upload') {
      const productId = String(body.productId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 100);
      if (!productId) throw new Error('Review ပုံအတွက် Product ID လိုအပ်ပါသည်။');
      folder = `/production/reviews/${uid}/${productId}`;
    } else if (isAdminAsset) {
      const userSnap = await getFirestoreDocument(env, 'users', uid);
      const profileRole = userSnap.exists ? String((userSnap.data || {}).role || '') : '';
      const role = ['admin_master', 'admin_staff'].includes(profileRole) ? profileRole : 'customer';
      if (!['admin_master', 'admin_staff'].includes(role)) throw new Error('Admin ခွင့်ပြုချက်လိုအပ်ပါသည်။');
      const assetType = String(body.assetType || 'products');
      const allowedFolders = { products: 'products', promotions: 'promotions', 'payment-qr': 'payment-qr' };
      if (!allowedFolders[assetType]) throw new Error('Upload folder မမှန်ကန်ပါ။');
      folder = `/production/${allowedFolders[assetType]}`;
    } else {
      throw new Error('Upload purpose မမှန်ကန်ပါ။');
    }

    const privateKey = String(env.IMAGEKIT_PRIVATE_KEY || '').trim();
    if (!privateKey || !env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit Environment Variables မပြည့်စုံပါ။');
    }

    const form = new FormData();
    form.append('file', new Blob([bytes], { type: actualMime }), fileName);
    form.append('fileName', fileName);
    form.append('folder', folder);
    form.append('useUniqueFileName', 'true');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`${privateKey}:`)}` },
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.message || `ImageKit upload failed (${response.status})`);
    return jsonResponse(200, { ok: true, url: data.url, fileId: data.fileId, folder });
  } catch (error) {
    console.error('Cloudflare imagekit-upload error:', error.message);
    return jsonResponse(400, { ok: false, error: error.message || 'Image upload failed.' });
  }
}
