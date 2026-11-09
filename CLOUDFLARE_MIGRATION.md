# DD Fashion — Cloudflare Pages migration staging

## Current stage: Stage 3 — OTP send/verify API port

This package is still a staged migration, not a Netlify-free production release.
The frontend continues to call Netlify endpoints. Keep the Netlify deployment and
its secrets active until every required Cloudflare route is ported and verified.

## Stage 1 preparation retained

- `wrangler.toml` configures the repository root as the static Pages output.
- The redundant root-level duplicate Netlify backend has been removed.
- The active `netlify/functions/` backend is retained unchanged for rollback.
- Firebase, Firestore rules/indexes, ImageKit, EmailJS, and current frontend API
  URLs are not changed.

## Stage 2 implementation

- Added `functions/api/user-session.js` for the Cloudflare route `/api/user-session`.
- Added `cloudflare/firebase-rest.js`, a Cloudflare-compatible helper using Web
  Crypto, Firebase Secure Token public keys, service-account OAuth, and Firestore
  REST API. It does not import `firebase-admin` or Node's `crypto` module.
- The route verifies Firebase ID-token signature and core claims, derives the
  server role from configured admin email lists, enforces email-to-UID mapping,
  and reads/writes the existing `users` and `email_uid_map` collections.

## Stage 3 implementation

- Added `functions/api/send-otp.js` for `/api/send-otp` and
  `functions/api/verify-otp.js` for `/api/verify-otp`.
- Added `functions/api/_otp.js` for Web Crypto OTP hashing, secure random OTP/salt
  generation, EmailJS configuration, and shared OTP constants.
- Added Firestore REST transaction support and Firebase Authentication Admin REST
  helpers to `cloudflare/firebase-rest.js`. No `firebase-admin`, Node `crypto`, or
  `node-fetch` dependency is used by these Cloudflare routes.
- Preserved the existing 6-digit OTP, 15-minute expiry, 60-second resend cooldown,
  five incorrect-attempt limit, per-email and per-IP hourly rate limits, EmailJS
  delivery template parameters, registration-after-verification flow, login OTP
  verification, password reset, and Firebase custom-token response shape.
- Admin role custom claims are included when creating/updating Firebase Auth users.
  Cloudflare service account therefore needs the required Firebase Authentication
  user-management IAM permission as well as Firestore access.
- The frontend still points to the original Netlify OTP endpoints; these new routes
  are staging-only until Preview tests pass.

## Cloudflare Pages settings

- Framework preset: None
- Root directory: repository root
- Build command: leave blank for the static HTML site
- Build output directory: `.`
- Configuration file: `wrangler.toml`

## Cloudflare variables and secrets

Use `.dev.vars.example` as the variable-name reference. Configure Preview and
Production independently. Keep private values in Cloudflare Secrets, never in
source files, Git, or browser JavaScript.

For Stage 2 and Stage 3 endpoints, configure:

- `FIREBASE_PROJECT_ID` — existing production project ID for production only;
  use the separate test Firebase project ID in Preview if desired.
- `FIREBASE_WEB_API_KEY` — Firebase Web API key for the project (public project identifier; keep configured server-side here).
- `FIREBASE_CLIENT_EMAIL` — Firebase service-account client email.
- `FIREBASE_PRIVATE_KEY` — Firebase service-account private key (Secret).
- `ADMIN_MASTER_EMAIL` — comma-separated master-admin email allowlist.
- `ADMIN_STAFF_EMAIL` — comma-separated staff-admin email allowlist.
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` — EmailJS delivery configuration.
- `EMAILJS_PRIVATE_KEY` — EmailJS private key (Secret, if configured).
- `SITE_URL` — optional canonical site origin used for EmailJS origin validation.

Do not paste credentials into chat or commit them into the ZIP. The route also
uses the public Firebase Secure Token signing-key endpoint and Google OAuth token
endpoint at runtime.

## Not migrated yet

ImageKit upload/auth, chat, and the large store-data API remain on Netlify. The frontend still calls Netlify for all existing flows. Do not remove
`netlify.toml`, `netlify/functions/`, or the Netlify environment variables.

## Verification and cutover checklist

1. Deploy this package to a Cloudflare Pages Preview project.
2. Add the Stage 2/3 variables/secrets to Preview (never overwrite Production yet).
3. Test `/api/user-session` with valid/invalid/expired tokens, email/UID conflict,
   new/existing user, and profile update.
4. Test `/api/send-otp` and `/api/verify-otp` in Preview for registration, login,
   reset, 15-minute expiry, resend cooldown, five-attempt lockout, per-email/IP
   hourly limits, EmailJS delivery failure rollback, and one-time OTP consumption.
   Verify the Preview project is isolated from Production data.
5. Port and test the remaining APIs, including ImageKit folder restrictions,
   chat, financial/reward idempotency, and admin authorization.
6. Switch frontend API URLs only after all routes pass Preview tests.
7. Verify end-to-end checkout, order, rewards, refunds, admin, chat, and upload
   flows before production cutover.
8. Keep Netlify available for rollback; remove it only after Cloudflare production
   has been verified.

## Validation performed locally

- JavaScript module syntax checks for the Cloudflare Stage 2/3 files.
- Existing project `npm test` suite plus Stage 2/3 structural safety tests.
- ZIP integrity check after packaging.

No live Cloudflare deployment, Firebase Auth Admin API request, EmailJS send, or live Firestore
read/write was performed in this environment. Preview testing is still required before frontend cutover.
