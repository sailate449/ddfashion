// Cloudflare Pages shared Firebase REST helpers for DD Fashion.
// No firebase-admin or Node-only modules are used in this runtime.

const FIREBASE_CERTS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit';
const FIRESTORE_ROOT = 'https://firestore.googleapis.com/v1/projects';

let cachedFirebaseKeys = null;
let cachedFirebaseKeysAt = 0;
let cachedAccessToken = null;
let cachedAccessTokenUntil = 0;
let cachedTokenKey = '';

export const FIELD_DELETE_SENTINEL = Symbol.for('dd.firestore.field.delete');

export const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

export function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

export function sha256Hex(value) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)))
    .then(bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join(''));
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function pemToBytes(pem) {
  const body = String(pem || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  return base64UrlToBytes(body.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''));
}

async function getFirebaseSigningKeys() {
  const now = Date.now();
  if (cachedFirebaseKeys && now - cachedFirebaseKeysAt < 50 * 60 * 1000) return cachedFirebaseKeys;
  const response = await fetch(FIREBASE_CERTS_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Unable to retrieve Firebase token verification keys.');
  const data = await response.json();
  cachedFirebaseKeys = data.keys || [];
  cachedFirebaseKeysAt = now;
  return cachedFirebaseKeys;
}

export async function verifyFirebaseIdToken(token, env) {
  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
  if (!projectId) throw new Error('Missing FIREBASE_PROJECT_ID Cloudflare variable.');
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid Firebase ID token.');

  const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported Firebase ID token signature.');

  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}` ||
      !claims.sub || typeof claims.sub !== 'string' || claims.sub.length > 128 ||
      !Number.isFinite(claims.exp) || claims.exp <= now ||
      !Number.isFinite(claims.iat) || claims.iat > now + 300 ||
      !Number.isFinite(claims.auth_time) || claims.auth_time > now + 300) {
    throw new Error('Invalid or expired Firebase ID token.');
  }

  const keyData = (await getFirebaseSigningKeys()).find(key => key.kid === header.kid);
  if (!keyData) {
    cachedFirebaseKeys = null;
    const refreshed = await getFirebaseSigningKeys();
    const retryKey = refreshed.find(key => key.kid === header.kid);
    if (!retryKey) throw new Error('Unrecognized Firebase token signing key.');
    return verifySignatureAndReturn(parts, retryKey, claims);
  }
  return verifySignatureAndReturn(parts, keyData, claims);
}

async function verifySignatureAndReturn(parts, jwk, claims) {
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) throw new Error('Invalid Firebase ID token signature.');
  return { ...claims, uid: claims.sub };
}

export async function createServiceAccountAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const clientEmail = String(env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKeyPem = String(env.FIREBASE_PRIVATE_KEY || '').trim();
  const tokenKey = `${clientEmail}:${env.FIREBASE_PROJECT_ID || ''}`;
  if (cachedAccessToken && cachedTokenKey === tokenKey && now < cachedAccessTokenUntil - 60) {
    return cachedAccessToken;
  }
  if (!clientEmail || !privateKeyPem) {
    throw new Error('Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY Cloudflare secret.');
  }

  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    iss: clientEmail,
    scope: FIRESTORE_SCOPE,
    aud: OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600
  })));
  const unsigned = `${header}.${payload}`;
  const signingKey = await crypto.subtle.importKey(
    'pkcs8', pemToBytes(privateKeyPem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', signingKey, new TextEncoder().encode(unsigned));
  const assertion = `${unsigned}.${bytesToBase64Url(signature)}`;
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error('Firebase service-account authorization failed.');
  cachedAccessToken = data.access_token;
  cachedTokenKey = tokenKey;
  cachedAccessTokenUntil = now + Math.min(Number(data.expires_in) || 3600, 3600);
  return cachedAccessToken;
}

export function encodeFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value)
    ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: encodeFirestoreFields(value) } };
  return { nullValue: null };
}

export function encodeFirestoreFields(object) {
  const fields = {};
  for (const [key, value] of Object.entries(object || {})) {
    if (value === undefined || value === FIELD_DELETE_SENTINEL) continue;
    fields[key] = encodeFirestoreValue(value);
  }
  return fields;
}

export function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

export function decodeFirestoreFields(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields || {})) result[key] = decodeFirestoreValue(value);
  return result;
}

export function firestoreDatabaseRoot(env) {
  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
  if (!projectId) throw new Error('Missing FIREBASE_PROJECT_ID Cloudflare variable.');
  return `${FIRESTORE_ROOT}/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

function firestoreDocumentUrl(env, collectionPath, documentId) {
  const cleanCol = String(collectionPath).split('/').map(encodeURIComponent).join('/');
  return `${firestoreDatabaseRoot(env)}/${cleanCol}/${encodeURIComponent(documentId)}`;
}

export async function firestoreRequest(env, url, options = {}) {
  const accessToken = await createServiceAccountAccessToken(env);
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 404) {
    const message = data.error?.message || `Firestore request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.firestoreStatus = data.error?.status;
    throw error;
  }
  return { response, data };
}

export async function getFirestoreDocument(env, collection, documentId, transaction = null) {
  let url = firestoreDocumentUrl(env, collection, documentId);
  if (transaction) url += `?transaction=${encodeURIComponent(transaction)}`;
  const { response, data } = await firestoreRequest(env, url);
  if (response.status === 404) return { exists: false, id: String(documentId), data: {} };
  return { exists: true, id: String(documentId), data: decodeFirestoreFields(data.fields || {}) };
}

export async function runStructuredQuery(env, structuredQuery, parentPath = '', transaction = null) {
  const root = firestoreDatabaseRoot(env);
  const url = parentPath ? `${root}/${parentPath}:runQuery` : `${root}:runQuery`;
  const body = { structuredQuery };
  if (transaction) body.transaction = transaction;
  const { data } = await firestoreRequest(env, url, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!Array.isArray(data)) return [];
  const results = [];
  for (const row of data) {
    if (row && row.document && row.document.name) {
      const parts = row.document.name.split('/');
      const id = decodeURIComponent(parts[parts.length - 1]);
      results.push({
        id,
        exists: true,
        data: decodeFirestoreFields(row.document.fields || {})
      });
    }
  }
  return results;
}

export async function listCollectionIds(env, parentDocPath = '') {
  const root = firestoreDatabaseRoot(env);
  const url = parentDocPath ? `${root}/${parentDocPath}:listCollectionIds` : `${root}:listCollectionIds`;
  const { data } = await firestoreRequest(env, url, {
    method: 'POST',
    body: JSON.stringify({ pageSize: 200 })
  });
  return Array.isArray(data.collectionIds) ? data.collectionIds : [];
}

export async function commitFirestoreWrites(env, writes, transaction) {
  const url = `${firestoreDatabaseRoot(env)}:commit`;
  const { data } = await firestoreRequest(env, url, {
    method: 'POST', body: JSON.stringify({ writes, ...(transaction ? { transaction } : {}) })
  });
  return data;
}

export function firestoreUpdateWrite(collection, documentId, fields, options = {}) {
  const projectId = options.projectId || '';
  const cleanCol = String(collection).split('/').map(encodeURIComponent).join('/');
  // CHANGE THIS LINE: remove https://firestore.googleapis.com/v1/
  const name = `projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${cleanCol}/${encodeURIComponent(documentId)}`;
  const write = { update: { name, fields: encodeFirestoreFields(fields) } };
  if (options.fieldPaths?.length) write.updateMask = { fieldPaths: options.fieldPaths };
  if (options.exists !== undefined) write.currentDocument = { exists: options.exists };
  return write;
}

export function resolveServerRole(email, env) {
  const clean = normalizeEmail(email);
  const masterList = String(env.ADMIN_MASTER_EMAIL || 'sailate449@gmail.com').split(',').map(normalizeEmail).filter(Boolean);
  const staffList = String(env.ADMIN_STAFF_EMAIL || 'staff@gmail.com').split(',').map(normalizeEmail).filter(Boolean);
  if (masterList.includes(clean)) return 'admin_master';
  if (staffList.includes(clean)) return 'admin_staff';
  return 'customer';
}

export async function runFirestoreTransaction(env, documentRefs, worker) {
  const root = firestoreDatabaseRoot(env);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: begun } = await firestoreRequest(env, `${root}:beginTransaction`, {
      method: 'POST', body: JSON.stringify({ options: { readWrite: {} } })
    });
    const transaction = begun.transaction;
    try {
      const snapshots = await Promise.all(documentRefs.map(async ref => {
        const cleanCol = String(ref.collection).split('/').map(encodeURIComponent).join('/');
        const url = `${root}/${cleanCol}/${encodeURIComponent(ref.id)}?transaction=${encodeURIComponent(transaction)}`;
        const { response, data } = await firestoreRequest(env, url);
        return response.status === 404
          ? { exists: false, data: {} }
          : { exists: true, data: decodeFirestoreFields(data.fields || {}) };
      }));
      const outcome = await worker(snapshots);
      if (outcome.writes?.length) await commitFirestoreWrites(env, outcome.writes, transaction);
      else await firestoreRequest(env, `${root}:commit`, { method: 'POST', body: JSON.stringify({ transaction }) });
      return outcome.result;
    } catch (error) {
      await firestoreRequest(env, `${root}:rollback`, {
        method: 'POST', body: JSON.stringify({ transaction })
      }).catch(() => {});
      if (error.firestoreStatus === 'ABORTED' && attempt < 4) continue;
      throw error;
    }
  }
  throw new Error('Firestore transaction could not be completed.');
}

export function firestoreDeleteWrite(collection, documentId, projectId) {
  const cleanCol = String(collection).split('/').map(encodeURIComponent).join('/');
  // CHANGE THIS LINE: remove https://firestore.googleapis.com/v1/
  return { delete: `projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${cleanCol}/${encodeURIComponent(documentId)}` };
}

export async function firebaseAdminRequest(env, method, payload) {
  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
  const accessToken = await createServiceAccountAccessToken(env);
  const apiKey = String(env.FIREBASE_WEB_API_KEY || '').trim();
  if (!apiKey) throw new Error('Missing FIREBASE_WEB_API_KEY Cloudflare variable.');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/${method}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Firebase Authentication request failed (${response.status}).`);
    error.status = response.status;
    error.authCode = data.error?.message || '';
    throw error;
  }
  return data;
}

export async function lookupFirebaseUserByEmail(env, email) {
  const data = await firebaseAdminRequest(env, 'accounts:lookup', { email: [normalizeEmail(email)] });
  return (data.users || [])[0] || null;
}

export async function createFirebaseUser(env, user) {
  return firebaseAdminRequest(env, 'accounts', user);
}

export async function updateFirebaseUser(env, user) {
  return firebaseAdminRequest(env, 'accounts:update', user);
}

export async function deleteFirebaseUser(env, uid) {
  return firebaseAdminRequest(env, 'accounts:delete', { localId: uid });
}

export async function createFirebaseCustomToken(env, uid, claims = {}) {
  const now = Math.floor(Date.now() / 1000);
  const clientEmail = String(env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKeyPem = String(env.FIREBASE_PRIVATE_KEY || '').trim();
  if (!clientEmail || !privateKeyPem) throw new Error('Missing Firebase service-account secrets.');
  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    iss: clientEmail, sub: clientEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now, exp: now + 3600, uid, claims
  })));
  const unsigned = `${header}.${payload}`;
  const signingKey = await crypto.subtle.importKey('pkcs8', pemToBytes(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', signingKey, new TextEncoder().encode(unsigned));
  return `${unsigned}.${bytesToBase64Url(signature)}`;
}
