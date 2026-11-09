// Cloudflare Pages Functions Adapter for Firebase Admin Firestore & Auth APIs
import {
  JSON_HEADERS,
  FIELD_DELETE_SENTINEL,
  normalizeEmail,
  resolveServerRole as resolveRoleWithEnv,
  verifyFirebaseIdToken,
  getFirestoreDocument,
  runStructuredQuery,
  listCollectionIds,
  commitFirestoreWrites,
  firestoreUpdateWrite,
  firestoreDeleteWrite,
  firestoreDatabaseRoot,
  firestoreRequest,
  encodeFirestoreValue,
  lookupFirebaseUserByEmail,
  updateFirebaseUser
} from '../../cloudflare/firebase-rest.js';

const OP_MAP = {
  '==': 'EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '!=': 'NOT_EQUAL',
  'array-contains': 'ARRAY_CONTAINS',
  'in': 'IN'
};

function sanitizeFieldPath(fp) {
  return String(fp).split('.').map(part => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part) ? part : `\`${part.replace(/\`/g, '\\`')}\``).join('.');
}

function collectTopLevelFieldPaths(obj) {
  return Object.keys(obj || {}).map(sanitizeFieldPath);
}

class DocSnap {
  constructor(ref, exists, dataObj) {
    this.ref = ref;
    this.id = ref.id;
    this.exists = Boolean(exists);
    this._data = dataObj || {};
  }
  data() {
    return this.exists ? { ...this._data } : undefined;
  }
}

class QuerySnap {
  constructor(docs) {
    this.docs = docs || [];
    this.size = this.docs.length;
    this.empty = this.docs.length === 0;
  }
  forEach(cb) {
    this.docs.forEach(cb);
  }
}

class DocRef {
  constructor(db, collectionPath, id) {
    this.db = db;
    this.collectionPath = String(collectionPath);
    this.id = String(id);
    this.path = `${this.collectionPath}/${this.id}`;
  }
  async get(transaction = null) {
    const res = await getFirestoreDocument(this.db.env, this.collectionPath, this.id, transaction);
    return new DocSnap(this, res.exists, res.data);
  }
  async set(data, options = {}) {
    const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'set', this, data, options);
    await commitFirestoreWrites(this.db.env, [write]);
  }
  async create(data) {
    const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'create', this, data);
    await commitFirestoreWrites(this.db.env, [write]);
  }
  async update(data) {
    const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'update', this, data);
    await commitFirestoreWrites(this.db.env, [write]);
  }
  async delete() {
    const write = firestoreDeleteWrite(this.collectionPath, this.id, this.db.env.FIREBASE_PROJECT_ID);
    await commitFirestoreWrites(this.db.env, [write]);
  }
  async listCollections() {
    const ids = await listCollectionIds(this.db.env, this.path);
    return ids.map(subId => new CollectionRef(this.db, `${this.path}/${subId}`));
  }
}

export function buildWriteOperation(projectId, type, docRef, data, options = {}) {
  if (type === 'delete') {
    return firestoreDeleteWrite(docRef.collectionPath, docRef.id, projectId);
  }
  if (type === 'create') {
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      exists: false
    });
  }
  if (type === 'update') {
    const fieldPaths = collectTopLevelFieldPaths(data);
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      exists: true,
      fieldPaths
    });
  }
  if (options && options.merge === true) {
    const fieldPaths = collectTopLevelFieldPaths(data);
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      fieldPaths
    });
  }
  return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, { projectId });
}

class QueryRef {
  constructor(db, collectionPath, filters = [], orders = [], limitCount = null, startAfterValues = null) {
    this.db = db;
    this.collectionPath = String(collectionPath);
    this._filters = filters;
    this._orders = orders;
    this._limit = limitCount;
    this._startAfter = startAfterValues;
  }
  where(field, op, value) {
    return new QueryRef(
      this.db,
      this.collectionPath,
      [...this._filters, { field, op, value }],
      this._orders,
      this._limit,
      this._startAfter
    );
  }
  orderBy(field, direction = 'asc') {
    const dir = String(direction || 'asc').toLowerCase() === 'desc' ? 'DESCENDING' : 'ASCENDING';
    return new QueryRef(
      this.db,
      this.collectionPath,
      this._filters,
      [...this._orders, { field, dir }],
      this._limit,
      this._startAfter
    );
  }
  limit(n) {
    return new QueryRef(
      this.db,
      this.collectionPath,
      this._filters,
      this._orders,
      Number(n),
      this._startAfter
    );
  }
  startAfter(...values) {
    return new QueryRef(
      this.db,
      this.collectionPath,
      this._filters,
      this._orders,
      this._limit,
      values
    );
  }
  async get(transaction = null) {
    const segments = this.collectionPath.split('/');
    const collectionId = segments[segments.length - 1];
    const parentPath = segments.length > 1 ? segments.slice(0, -1).join('/') : '';
    const rootDocPrefix = `${firestoreDatabaseRoot(this.db.env)}/${this.collectionPath}`;

    const structuredQuery = {
      from: [{ collectionId }]
    };

    if (this._filters.length === 1) {
      const f = this._filters[0];
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: f.field },
          op: OP_MAP[f.op] || 'EQUAL',
          value: encodeFirestoreValue(f.value)
        }
      };
    } else if (this._filters.length > 1) {
      structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters: this._filters.map(f => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: OP_MAP[f.op] || 'EQUAL',
              value: encodeFirestoreValue(f.value)
            }
          }))
        }
      };
    }

    if (this._orders.length > 0) {
      structuredQuery.orderBy = this._orders.map(o => ({
        field: { fieldPath: o.field },
        direction: o.dir
      }));
    }

    if (this._startAfter && this._startAfter.length > 0) {
      structuredQuery.startAt = {
        before: false,
        values: this._startAfter.map((val, idx) => {
          const orderField = this._orders[idx]?.field;
          if (orderField === '__name__') {
            const fullRefName = String(val).startsWith('projects/')
              ? String(val)
              : `${rootDocPrefix.replace(/^https:\/\/firestore\.googleapis\.com\/v1\//, '')}/${encodeURIComponent(String(val))}`;
            return { referenceValue: fullRefName };
          }
          return encodeFirestoreValue(val);
        })
      };
    }

    if (this._limit !== null && Number.isFinite(this._limit)) {
      structuredQuery.limit = Math.max(1, Math.floor(this._limit));
    }

    const rawDocs = await runStructuredQuery(this.db.env, structuredQuery, parentPath, transaction);
    const snaps = rawDocs.map(item => new DocSnap(new DocRef(this.db, this.collectionPath, item.id), true, item.data));
    return new QuerySnap(snaps);
  }
}

class CollectionRef extends QueryRef {
  constructor(db, collectionPath) {
    super(db, collectionPath);
  }
  doc(id) {
    const docId = id ? String(id) : `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return new DocRef(this.db, this.collectionPath, docId);
  }
}

class WriteBatch {
  constructor(db) {
    this.db = db;
    this.writes = [];
  }
  set(docRef, data, options = {}) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'set', docRef, data, options));
    return this;
  }
  create(docRef, data) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'create', docRef, data));
    return this;
  }
  update(docRef, data) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'update', docRef, data));
    return this;
  }
  delete(docRef) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'delete', docRef));
    return this;
  }
  async commit() {
    if (!this.writes.length) return;
    await commitFirestoreWrites(this.db.env, this.writes);
  }
}

class TransactionRunner {
  constructor(db, transactionId) {
    this.db = db;
    this.transactionId = transactionId;
    this.writes = [];
  }
  async get(refOrQuery) {
    if (refOrQuery instanceof DocRef) {
      return refOrQuery.get(this.transactionId);
    }
    if (refOrQuery instanceof QueryRef) {
      return refOrQuery.get(this.transactionId);
    }
    throw new Error('Unsupported transaction get target.');
  }
  set(docRef, data, options = {}) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'set', docRef, data, options));
    return this;
  }
  create(docRef, data) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'create', docRef, data));
    return this;
  }
  update(docRef, data) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'update', docRef, data));
    return this;
  }
  delete(docRef) {
    this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, 'delete', docRef));
    return this;
  }
}

class FirestoreClient {
  constructor(env) {
    this.env = env;
  }
  collection(path) {
    return new CollectionRef(this, path);
  }
  batch() {
    return new WriteBatch(this);
  }
  async listCollections() {
    const ids = await listCollectionIds(this.env, '');
    return ids.map(id => new CollectionRef(this, id));
  }
  async runTransaction(updateFunction) {
    const root = firestoreDatabaseRoot(this.env);
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: begun } = await firestoreRequest(this.env, `${root}:beginTransaction`, {
        method: 'POST',
        body: JSON.stringify({ options: { readWrite: {} } })
      });
      const transactionId = begun.transaction;
      const tx = new TransactionRunner(this, transactionId);
      try {
        const result = await updateFunction(tx);
        if (tx.writes.length > 0) {
          await commitFirestoreWrites(this.env, tx.writes, transactionId);
        } else {
          await firestoreRequest(this.env, `${root}:commit`, {
            method: 'POST',
            body: JSON.stringify({ transaction: transactionId })
          });
        }
        return result;
      } catch (error) {
        await firestoreRequest(this.env, `${root}:rollback`, {
          method: 'POST',
          body: JSON.stringify({ transaction: transactionId })
        }).catch(() => {});
        if (error.firestoreStatus === 'ABORTED' && attempt < 4) continue;
        throw error;
      }
    }
    throw new Error('Firestore transaction could not be completed after retries.');
  }
}

class AuthClient {
  constructor(env) {
    this.env = env;
  }
  async verifyIdToken(idToken) {
    return verifyFirebaseIdToken(idToken, this.env);
  }
  async getUserByEmail(email) {
    const user = await lookupFirebaseUserByEmail(this.env, email);
    if (!user) {
      const err = new Error('There is no user record corresponding to the provided identifier.');
      err.code = 'auth/user-not-found';
      throw err;
    }
    return {
      uid: user.localId,
      email: user.email,
      displayName: user.displayName || '',
      emailVerified: Boolean(user.emailVerified)
    };
  }
  async setCustomUserClaims(uid, claims) {
    await updateFirebaseUser(this.env, {
      localId: uid,
      customAttributes: JSON.stringify(claims || {})
    });
  }
}

export function createAdminCompat(env) {
  const firestoreInstance = new FirestoreClient(env);
  const authInstance = new AuthClient(env);
  const firestoreFn = () => firestoreInstance;
  firestoreFn.FieldPath = {
    documentId: () => '__name__'
  };
  firestoreFn.FieldValue = {
    delete: () => FIELD_DELETE_SENTINEL
  };
  return {
    apps: [true],
    app: () => ({}),
    initializeApp: () => ({}),
    firestore: firestoreFn,
    auth: () => authInstance,
    resolveServerRole: (email) => resolveRoleWithEnv(email, env)
  };
}

export function sha256HexSync(ascii) {
  const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const bytes = new TextEncoder().encode(String(ascii));
  const bitLength = bytes.length * 8;
  let hash = sha256HexSync.h = sha256HexSync.h || [];
  const k = sha256HexSync.k = sha256HexSync.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  hash = hash.slice(0, 8);
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  view.setUint32(padded.length - 8, Math.floor(bitLength / maxWord) >>> 0, false);
  for (let j = 0; j < padded.length; j += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(j + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0; hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0; hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
  }
  for (let i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }
  return result;
}

export const cryptoCompat = {
  createHash(alg) {
    if (String(alg).toLowerCase() !== 'sha256') throw new Error(`Unsupported hash: ${alg}`);
    let data = '';
    return {
      update(val) { data += String(val); return this; },
      digest(enc) { return sha256HexSync(data); }
    };
  },
  randomBytes(size) {
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    return {
      toString(enc) {
        if (enc === 'hex') return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
        return String.fromCharCode(...bytes);
      }
    };
  }
};

export const BufferCompat = {
  from(input, encoding = 'utf8') {
    if (encoding === 'base64') {
      const bin = atob(String(input));
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }
    const bytes = new TextEncoder().encode(String(input));
    return {
      toString(enc) {
        if (enc === 'base64') {
          let bin = '';
          for (const b of bytes) bin += String.fromCharCode(b);
          return btoa(bin);
        }
        return new TextDecoder().decode(bytes);
      }
    };
  }
};

export { JSON_HEADERS, normalizeEmail };
