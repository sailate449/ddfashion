'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'netlify/functions', 'store-data.js'), 'utf8');
const start = source.indexOf('function isComingSoonOnlyProduct(product) {');
const end = source.indexOf('function isPyinOoLwinCity(value) {', start);
assert(start >= 0 && end > start, 'Server Coming Soon guard was not found.');
const helper = source.slice(start, end);
const context = {};
vm.runInNewContext(`${helper}\nthis.check = isComingSoonOnlyProduct;`, context);
const check = context.check;
assert.strictEqual(check({ displaySection: 'coming_soon' }), true, 'Coming Soon-only must be blocked.');
assert.strictEqual(check({ comingSoon: true, showInShop: false }), true, 'Legacy Coming Soon-only must be blocked.');
assert.strictEqual(check({ comingSoon: true }), true, 'Legacy Coming Soon-only without Shop flag must be blocked.');
assert.strictEqual(check({ displaySection: 'both', comingSoon: true }), false, 'Shop + Coming Soon must remain orderable.');
assert.strictEqual(check({ displaySection: 'shop', comingSoon: true }), false, 'Explicit Shop products must remain orderable.');
assert.strictEqual(check({ comingSoon: true, showInShop: true }), false, 'Legacy dual-display products must remain orderable.');
assert.strictEqual(check({ displaySection: 'shop' }), false, 'Normal Shop products must remain orderable.');
console.log('Coming Soon order safety tests passed.');


// Product deletion must clean up only exact ImageKit assets under /production/.
const cleanupStart = source.indexOf('function collectProductImageUrls(product) {');
const cleanupEnd = source.indexOf('exports.handler = async (event) => {', cleanupStart);
assert(cleanupStart >= 0 && cleanupEnd > cleanupStart, 'Product/ImageKit cleanup helper was not found.');
const cleanupContext = { URL, Buffer, process: { env: { IMAGEKIT_PRIVATE_KEY: 'test-private-key' } }, fetch: async (url, options = {}) => {
  const parsed = new URL(String(url));
  if (parsed.hostname === 'api.imagekit.io' && parsed.pathname === '/v1/files') {
    return { ok: true, json: async () => [{ fileId: 'file-123', filePath: '/production/products/shoe.webp', url: 'https://ik.imagekit.io/acct/production/products/shoe.webp' }, { fileId: 'other', filePath: '/production/products/shoe-other.webp', url: 'https://ik.imagekit.io/acct/production/products/shoe-other.webp' }] };
  }
  if (parsed.hostname === 'api.imagekit.io' && parsed.pathname === '/v1/files/file-123' && options.method === 'DELETE') return { ok: true, status: 204 };
  throw new Error(`Unexpected ImageKit request: ${url}`);
} };
vm.runInNewContext(`${source.slice(cleanupStart, cleanupEnd)}\nthis.cleanup = deleteProductImageKitAssets;`, cleanupContext);
(async () => {
  const result = await cleanupContext.cleanup({ images: ['https://ik.imagekit.io/acct/production/products/shoe.webp?tr=w-400', 'https://external.example/photo.jpg'] });
  assert.strictEqual(result.deleted, 1, 'Exact matching ImageKit product asset should be deleted.');
  assert.strictEqual(result.skipped, 0, 'All supplied production ImageKit URLs should be accounted for.');
  console.log('Product ImageKit deletion tests passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
