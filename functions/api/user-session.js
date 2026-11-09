import {
  jsonResponse, normalizeEmail, sha256Hex, verifyFirebaseIdToken,
  getFirestoreDocument, commitFirestoreWrites, firestoreUpdateWrite,
  resolveServerRole, updateFirebaseUser
} from '../../cloudflare/firebase-rest.js';

function getBearerToken(request, body) {
  const header = request.headers.get('Authorization') || '';
  return (header.startsWith('Bearer ') ? header.slice(7).trim() : '') || String(body.idToken || '').trim();
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }});
  if (request.method !== 'POST') return jsonResponse(405, { ok: false, error: 'Method Not Allowed' });

  try {
    let body = {};
    try { body = await request.json(); } catch (_) { body = {}; }
    const idToken = getBearerToken(request, body);
    if (!idToken) return jsonResponse(401, { ok: false, error: 'Missing Firebase ID token.' });

    const decoded = await verifyFirebaseIdToken(idToken, env);
    const uid = decoded.sub;
    const email = normalizeEmail(decoded.email);
    if (!email || !uid) return jsonResponse(401, { ok: false, error: 'Firebase account email is unavailable.' });

    const role = resolveServerRole(email, env);
    if (decoded.role !== role && env.FIREBASE_WEB_API_KEY) {
      await updateFirebaseUser(env, { localId: uid, customAttributes: JSON.stringify({ role }) }).catch(() => {});
    }
    const emailKey = await sha256Hex(email);
    const mapId = emailKey;
    const [mapSnap, userSnap] = await Promise.all([
      getFirestoreDocument(env, 'email_uid_map', mapId),
      getFirestoreDocument(env, 'users', uid)
    ]);

    if (mapSnap.exists && mapSnap.data.uid !== uid) {
      return jsonResponse(409, { ok: false, error: 'ဤ Email သည် အခြား UID နှင့် ချိတ်ဆက်ထားပါသည်။ Support ကို ဆက်သွယ်ပါ။' });
    }
    const existingEmail = normalizeEmail(userSnap.data.email);
    if (userSnap.exists && existingEmail && existingEmail !== email) {
      return jsonResponse(409, { ok: false, error: 'ဤ UID သည် အခြား Email နှင့် ချိတ်ဆက်ထားပါသည်။ Support ကို ဆက်သွယ်ပါ။' });
    }

    const now = Date.now();
    const writes = [];
    if (!mapSnap.exists) {
      writes.push(firestoreUpdateWrite('email_uid_map', mapId, {
        email, uid, createdAt: now, migrated: true
      }, { projectId: env.FIREBASE_PROJECT_ID, exists: false }));
    }

    let profile = userSnap.data || {};
    if (body.action === 'update_profile') {
      const updatedFields = {
        uid, email, role,
        name: String(body.name || profile.name || '').trim(),
        phone: String(body.phone || profile.phone || '').trim(),
        address: String(body.address || profile.address || '').trim(),
        updatedAt: now
      };
      writes.push(firestoreUpdateWrite('users', uid, updatedFields, {
        projectId: env.FIREBASE_PROJECT_ID,
        exists: userSnap.exists,
        fieldPaths: Object.keys(updatedFields)
      }));
      profile = { ...profile, ...updatedFields };
    } else if (!userSnap.exists) {
      const initProfile = {
        uid, email, emailKey, role,
        name: decoded.name || (role === 'admin_master' ? 'Master Admin' : role === 'admin_staff' ? 'Staff Member' : email.split('@')[0]),
        emailVerified: !!decoded.email_verified,
        pointsBalance: 0,
        totalPointsEarned: 0,
        createdAt: now,
        updatedAt: now
      };
      writes.push(firestoreUpdateWrite('users', uid, initProfile, {
        projectId: env.FIREBASE_PROJECT_ID, exists: false
      }));
      profile = initProfile;
    } else {
      const updates = { uid, email, emailKey, updatedAt: now };
      if (profile.role !== role) updates.role = role;
      writes.push(firestoreUpdateWrite('users', uid, updates, {
        projectId: env.FIREBASE_PROJECT_ID,
        exists: true,
        fieldPaths: Object.keys(updates)
      }));
      profile = { ...profile, ...updates };
    }

    if (writes.length) {
      try {
        await commitFirestoreWrites(env, writes);
      } catch (writeError) {
        // A concurrent first login may win the unique email-map create.
        // Re-read and accept only if it maps to this same UID.
        if (!mapSnap.exists) {
          const freshMap = await getFirestoreDocument(env, 'email_uid_map', mapId);
          if (!freshMap.exists || freshMap.data.uid !== uid) throw writeError;
          if (writes.length > 1) {
            const remainingWrites = writes.slice(1);
            await commitFirestoreWrites(env, remainingWrites);
          }
        } else {
          throw writeError;
        }
      }
    }

    return jsonResponse(200, {
      ok: true, uid, email, role,
      name: profile.name || email.split('@')[0],
      phone: profile.phone || '',
      address: profile.address || '',
      pointsBalance: Number(profile.pointsBalance || 0),
      totalPointsEarned: Number(profile.totalPointsEarned || 0)
    });
  } catch (error) {
    console.error('Cloudflare user-session error:', error);
    return jsonResponse(401, { ok: false, error: error.message || 'Invalid or expired session token.' });
  }
}
