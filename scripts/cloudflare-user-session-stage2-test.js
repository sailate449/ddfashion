const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const shared = fs.readFileSync(path.join(root, 'cloudflare/firebase-rest.js'), 'utf8');
const route = fs.readFileSync(path.join(root, 'functions/api/user-session.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(shared.includes('crypto.subtle.verify'), 'Firebase ID token signature verification is missing.');
assert(shared.includes('claims.auth_time'), 'Firebase ID token auth_time validation is missing.');
assert(shared.includes('securetoken@system.gserviceaccount.com'), 'Firebase public signing key endpoint is missing.');
assert(shared.includes('oauth2.googleapis.com/token'), 'Service-account OAuth token exchange is missing.');
assert(shared.includes('firestore.googleapis.com/v1/projects'), 'Firestore REST API integration is missing.');
assert(!shared.includes("require('firebase-admin')"), 'Cloudflare shared helper must not depend on firebase-admin.');
assert(!shared.includes("require('crypto')"), 'Cloudflare shared helper must not depend on Node crypto.');
assert(route.includes('export async function onRequest(context)'), 'Cloudflare Pages onRequest handler is missing.');
assert(route.includes('const uid = decoded.sub;'), 'Firebase UID must be read from the verified token subject.');
assert(route.includes("'email_uid_map'"), 'Email-to-UID uniqueness mapping is missing.');
assert(shared.includes('write.currentDocument = { exists: options.exists }'), 'Firestore write preconditions are required for uniqueness protection.');
assert(html.includes("'/api/user-session'"), 'Stage 2 must not switch the production frontend prematurely.');
console.log('Cloudflare user-session Stage 2 structural safety checks passed.');
