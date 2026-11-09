# DD Fashion — Cloudflare Pages Deployment Guide

1. Upload the contents of `DD_Fashion_Updated_Project-v4` to your GitHub repository.
2. In Cloudflare Dashboard -> Workers & Pages -> `ddfashion-v2` -> Settings -> Variables and Secrets, configure all 14 variables (`FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `ADMIN_MASTER_EMAIL`, `ADMIN_STAFF_EMAIL`, `SITE_URL`) for both Production and Preview.
3. Deploy via GitHub integration or `npx wrangler pages deploy . --project-name=ddfashion-v2`.
