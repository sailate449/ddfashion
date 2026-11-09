const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const netlify = fs.readFileSync(path.join(root, 'netlify/functions/store-data.js'), 'utf8');
const firebase = fs.readFileSync(path.join(root, 'functions/api/store-data.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
function assert(ok, message) { if (!ok) throw new Error(message); }
for (const type of ['points', 'rewards', 'financial']) {
  assert(html.includes(`data-audit-center="${type}"`), `Missing ${type} audit center UI`);
  assert(html.includes(`window.loadAuditCenter = async (type, reset = false)`), 'Missing server-paged loader');
}
for (const token of ['admin_query_audit_records', 'points_ledger', 'points_audit_logs', 'cashback_ledger', 'purchase_reward_ledger', 'financial_audit_logs', 'verifyAdminRequest(event)', 'startAfter', 'maxScanPerSource']) {
  assert(netlify.includes(token), `Missing backend audit safety feature: ${token}`);
  assert(firebase.includes(token), `Firebase Functions backend mismatch: ${token}`);
}
assert(firebase.includes('export async function onRequest'), 'Cloudflare store-data must export onRequest');
const queryBlock = netlify.slice(netlify.indexOf("if (action === 'admin_query_audit_records')"), netlify.indexOf("if (action === 'admin_imagekit_orphan_preview'"));
assert(queryBlock.includes('isMatch(item, source)') && queryBlock.includes('_docId: doc.id'), 'Audit query must scope source filters and preserve Firestore document cursor IDs');
assert(!/\.\s*(set|create|update|delete)\s*\(/.test(queryBlock), 'Audit query endpoint must remain read-only');
assert(queryBlock.includes('dateFrom') && queryBlock.includes('dateTo') && queryBlock.includes('maxScanPerSource'), 'Audit query must support date filtering and bounded progressive scans');
assert(html.includes('LIVE DATA') && html.includes('data-audit-export') && html.includes('showAdminAuditDetail'), 'Missing live, export, or detail UI');
assert((html.match(/<option>10<\/option>/g) || []).length === 3, 'All audit centers must offer a 10-record page size');
assert(html.includes('pageSize: Math.max(10, Math.min(100,'), 'Frontend audit page size must allow 10 records');
assert(netlify.includes('const pageSize = Math.max(10, Math.min(100,'), 'Backend audit page size must allow 10 records');
assert(html.includes('document.body.appendChild(modal)'), 'Audit details modal must be moved to body for viewport centering');
assert(pkg.scripts.test.includes('audit-center-safety-test.js'), 'Audit safety test is not in npm test');
console.log('Audit center safety tests passed.');
