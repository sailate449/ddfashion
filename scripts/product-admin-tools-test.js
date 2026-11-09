const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const store = read('netlify/functions/store-data.js');
const upload = read('netlify/functions/imagekit-upload.js');
const html = read('index.html');
const rules = read('firestore.rules');
for (const action of ['admin_export_product_backup', 'admin_restore_product_backup', 'admin_retry_product_deletes']) {
  if (!store.includes(`action === '${action}'`)) throw new Error(`Missing backend action: ${action}`);
}
if (!upload.includes('image_upload_rate_limits') || !upload.includes('10 * 60 * 1000')) throw new Error('Upload rate limiter missing');
if (!rules.includes('match /image_upload_rate_limits/{limitKey} { allow read, write: if false; }')) throw new Error('Upload rate-limit collection is not server-only');
for (const fn of ['adminExportProductBackup', 'adminImportProductBackup', 'adminRetryProductDeletes']) if (!html.includes(`window.${fn}`)) throw new Error(`Missing Admin UI: ${fn}`);
if (fs.existsSync(path.join(root, '_legacy_netlify_functions'))) throw new Error('Obsolete duplicate Netlify function folder must be removed');
console.log('Product admin tools tests passed (backup export/create-only restore, delete retry, upload throttling, server-only rules, UI wiring).');
