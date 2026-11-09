# DD Fashion — Complete Netlify to Cloudflare Pages Migration Report

All frontend routes (`index.html`) now call `/api/*` Cloudflare Pages Functions (`user-session`, `send-otp`, `verify-otp`, `imagekit-auth`, `imagekit-upload`, `chat-data`, `store-data`). All backend functions run natively on Cloudflare Workers Runtime using Web Crypto and Firebase REST API (`cloudflare/firebase-rest.js` + `functions/api/_cf-adapter.js`).
