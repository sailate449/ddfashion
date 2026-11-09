const {
  JSON_HEADERS,
  admin,
  initFirebaseAdmin,
  normalizeEmail,
  sha256Hex,
  resolveServerRole
} = require('./_shared');

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
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {}

    const idToken = token || body.idToken;
    if (!idToken) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Missing Firebase ID token.' })
      };
    }

    initFirebaseAdmin();
    const auth = admin.auth();
    const db = admin.firestore();

    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = normalizeEmail(decoded.email);
    const role = resolveServerRole(email);

    if (decoded.role !== role) {
      await auth.setCustomUserClaims(uid, { role });
    }

    const userRef = db.collection('users').doc(uid);
    const emailMapRef = db.collection('email_uid_map').doc(sha256Hex(email));
    // Keep legacy accounts compatible while enforcing the same unique mapping.
    await db.runTransaction(async (tx) => {
      const [mapSnap, userSnap] = await Promise.all([tx.get(emailMapRef), tx.get(userRef)]);
      if (mapSnap.exists && mapSnap.data().uid !== uid) {
        const err = new Error('ဤ Email သည် အခြား UID နှင့် ချိတ်ဆက်ထားပါသည်။ Support ကို ဆက်သွယ်ပါ။');
        err.code = 'EMAIL_UID_CONFLICT';
        throw err;
      }
      if (userSnap.exists && normalizeEmail(userSnap.data().email) && normalizeEmail(userSnap.data().email) !== email) {
        const err = new Error('ဤ UID သည် အခြား Email နှင့် ချိတ်ဆက်ထားပါသည်။ Support ကို ဆက်သွယ်ပါ။');
        err.code = 'UID_EMAIL_CONFLICT';
        throw err;
      }
      if (!mapSnap.exists) tx.create(emailMapRef, { email, uid, createdAt: Date.now(), migrated: true });
      if (userSnap.exists) tx.set(userRef, { uid, email, emailKey: sha256Hex(email), updatedAt: Date.now() }, { merge: true });
    });
    const snap = await userRef.get();
    let profile = snap.exists ? snap.data() : {};

    if (body.action === 'update_profile') {
      const updatedFields = {
        uid,
        email,
        role,
        name: String(body.name || profile.name || '').trim(),
        phone: String(body.phone || profile.phone || '').trim(),
        address: String(body.address || profile.address || '').trim(),
        updatedAt: Date.now()
      };
      await userRef.set(updatedFields, { merge: true });
      profile = { ...profile, ...updatedFields };
    } else if (!snap.exists) {
      const initProfile = {
        uid,
        email,
        emailKey: sha256Hex(email),
        role,
        name: decoded.name || (role === 'admin_master' ? 'Master Admin' : role === 'admin_staff' ? 'Staff Member' : email.split('@')[0]),
        emailVerified: !!decoded.email_verified,
        pointsBalance: 0,
        totalPointsEarned: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await userRef.set(initProfile, { merge: true });
      profile = initProfile;
    } else if (profile.role !== role) {
      await userRef.set({ role, updatedAt: Date.now() }, { merge: true });
      profile.role = role;
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: true,
        uid,
        email,
        role,
        name: profile.name || email.split('@')[0],
        phone: profile.phone || '',
        address: profile.address || '',
        pointsBalance: Number(profile.pointsBalance || 0),
        totalPointsEarned: Number(profile.totalPointsEarned || 0)
      })
    };
  } catch (err) {
    console.error('user-session error:', err);
    return {
      statusCode: 401,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err.message || 'Invalid or expired session token.'
      })
    };
  }
};
