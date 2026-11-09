const { admin, initFirebaseAdmin, JSON_HEADERS, normalizeEmail } = require('./_shared');

function reply(statusCode, payload) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}
function cleanText(value) {
  return String(value || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'Method Not Allowed' });
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return reply(401, { ok: false, error: 'Login လုပ်ပြီးမှ Chat အသုံးပြုနိုင်ပါသည်။' });
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (_) { return reply(400, { ok: false, error: 'Invalid JSON request body.' }); }

    initFirebaseAdmin();
    const auth = admin.auth();
    const db = admin.firestore();
    const decoded = await auth.verifyIdToken(token);
    const profileSnap = await db.collection('users').doc(decoded.uid).get();
    const profile = profileSnap.exists ? (profileSnap.data() || {}) : {};
    const role = ['admin_master', 'admin_staff'].includes(profile.role) ? profile.role : 'customer';
    const isAdmin = role === 'admin_master' || role === 'admin_staff';
    const action = String(body.action || 'get').toLowerCase();
    const chatsRef = db.collection('customer_chats');

    if (action === 'list') {
      if (!isAdmin) return reply(403, { ok: false, error: 'Admin ခွင့်ပြုချက် လိုအပ်ပါသည်။' });
      const snap = await chatsRef.orderBy('updatedAt', 'desc').limit(500).get();
      const chats = {};
      snap.forEach(doc => { chats[doc.id] = { ...doc.data(), id: doc.id }; });
      return reply(200, { ok: true, chats });
    }

    if (action === 'get') {
      const targetUid = isAdmin && body.userId ? String(body.userId) : decoded.uid;
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(targetUid)) return reply(400, { ok: false, error: 'Invalid chat user.' });
      if (!isAdmin && targetUid !== decoded.uid) return reply(403, { ok: false, error: 'ကိုယ်ပိုင် Chat ကိုသာ ကြည့်နိုင်ပါသည်။' });
      const snap = await chatsRef.doc(targetUid).get();
      return reply(200, { ok: true, chat: snap.exists ? { ...snap.data(), id: snap.id } : null });
    }

    if (action === 'send_user' || action === 'send_admin') {
      const text = cleanText(body.text);
      if (!text) return reply(400, { ok: false, error: 'စာတိုအလွတ် ပို့၍မရပါ။' });
      const targetUid = action === 'send_admin' ? String(body.userId || '') : decoded.uid;
      if (action === 'send_admin' && !isAdmin) return reply(403, { ok: false, error: 'Admin ခွင့်ပြုချက် လိုအပ်ပါသည်။' });
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(targetUid)) return reply(400, { ok: false, error: 'Invalid chat user.' });
      const ref = chatsRef.doc(targetUid);
      const now = Date.now();
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        const old = snap.exists ? (snap.data() || {}) : {};
        const messages = Array.isArray(old.messages) ? old.messages.slice(-299) : [];
        const sender = action === 'send_admin' ? 'admin' : 'user';
        messages.push({ sender, senderUid: decoded.uid, text, time: now });
        const userSnap = action === 'send_user' ? profileSnap : null;
        const displayName = String(old.name || profile.name || decoded.name || decoded.email || 'Customer').slice(0, 120);
        const next = {
          uid: targetUid,
          email: normalizeEmail(old.email || (action === 'send_user' ? decoded.email : '')),
          name: displayName,
          messages,
          unreadAdmin: Math.max(0, Number(old.unreadAdmin || 0)) + (sender === 'user' ? 1 : 0),
          unreadUser: sender === 'admin' ? Math.max(0, Number(old.unreadUser || 0)) + 1 : Math.max(0, Number(old.unreadUser || 0)),
          createdAt: old.createdAt || now,
          updatedAt: now
        };
        if (sender === 'user' && userSnap && userSnap.exists) {
          const user = userSnap.data() || {};
          next.name = String(user.name || user.email || displayName).slice(0, 120);
          next.email = normalizeEmail(user.email || decoded.email);
        }
        tx.set(ref, next, { merge: true });
      });
      return reply(200, { ok: true, message: 'ပို့ပြီးပါပြီ။' });
    }

    if (action === 'mark_read') {
      const targetUid = isAdmin && body.userId ? String(body.userId) : decoded.uid;
      if (!isAdmin && targetUid !== decoded.uid) return reply(403, { ok: false, error: 'Forbidden.' });
      const ref = chatsRef.doc(targetUid);
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        tx.update(ref, isAdmin ? { unreadAdmin: 0, updatedAt: Date.now() } : { unreadUser: 0, updatedAt: Date.now() });
      });
      return reply(200, { ok: true });
    }

    if (action === 'migrate_legacy') {
      if (!isAdmin) return reply(403, { ok: false, error: 'Admin ခွင့်ပြုချက် လိုအပ်ပါသည်။' });
      const legacySnap = await db.collection('store_config').doc('chats').get();
      if (!legacySnap.exists || !legacySnap.data().threads) return reply(200, { ok: true, migrated: 0 });
      let migrated = 0;
      const threads = legacySnap.data().threads || {};
      for (const legacy of Object.values(threads)) {
        const email = normalizeEmail(legacy && legacy.name);
        if (!email || !email.includes('@')) continue;
        let user;
        try { user = await auth.getUserByEmail(email); } catch (_) { continue; }
        const uid = user.uid;
        const ref = chatsRef.doc(uid);
        await db.runTransaction(async tx => {
          const current = await tx.get(ref);
          if (current.exists) return;
          const messages = (Array.isArray(legacy.messages) ? legacy.messages : []).slice(-300).map(m => ({
            sender: m && m.sender === 'admin' ? 'admin' : 'user',
            senderUid: m && m.sender === 'admin' ? decoded.uid : uid,
            text: cleanText(m && m.text), time: Number(m && m.time) || Date.now()
          })).filter(m => m.text);
          tx.create(ref, { uid, email, name: email, messages, unreadAdmin: Math.max(0, Number(legacy.unreadAdmin || 0)), unreadUser: Math.max(0, Number(legacy.unreadUser || 0)), createdAt: Date.now(), updatedAt: Date.now(), migratedFromLegacy: true });
        });
        migrated++;
      }
      return reply(200, { ok: true, migrated });
    }

    return reply(400, { ok: false, error: 'Unknown chat action.' });
  } catch (err) {
    console.error('chat-data error:', err);
    return reply(401, { ok: false, error: err.message || 'Chat request failed.' });
  }
};
