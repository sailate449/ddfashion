const { JSON_HEADERS } = require('./_shared');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  return { statusCode: 410, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'Legacy ImageKit signature endpoint disabled. Use the secure imagekit-upload endpoint.' }) };
};
