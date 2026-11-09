# Cloudflare Pages Functions

This folder contains Cloudflare-native Pages Functions. These handlers use the
`onRequest` contract and must not be replaced with the legacy Netlify
`exports.handler` files.

Current staged routes:
- `api/user-session.js` -> `/api/user-session`
- `api/send-otp.js` -> `/api/send-otp`
- `api/verify-otp.js` -> `/api/verify-otp`

The frontend still calls the active Netlify endpoints. Do not switch frontend URLs
or remove `netlify/functions/` until all Cloudflare Preview route tests and
end-to-end flows have passed.
