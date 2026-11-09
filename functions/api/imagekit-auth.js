import { JSON_HEADERS, jsonResponse } from '../../cloudflare/firebase-rest.js';

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
  return jsonResponse(410, {
    ok: false,
    error: 'Legacy ImageKit signature endpoint disabled. Use the secure imagekit-upload endpoint.'
  });
}
