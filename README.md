# DD Fashion — Cloudflare Migration Staging Package (Netlify backend retained during transition)

## Folder Structure
```
index.html
wrangler.toml
CLOUDFLARE_MIGRATION.md
.dev.vars.example
netlify.toml  (temporary rollback/current backend)
package.json
firestore.rules
netlify/functions/  (current Netlify backend)
functions/api/  (Cloudflare Pages Functions: user-session, send-otp, verify-otp)
cloudflare/  (shared Cloudflare Firebase REST helpers)
netlify/
  functions/
    _shared.js
    send-otp.js
    verify-otp.js
    user-session.js
```

## Required Netlify Environment Variables
In Netlify Dashboard -> **Site configuration** -> **Environment variables**, configure:

### Firebase Admin SDK Variables (Production Firebase Project: `ddfashion-36025`)
- `FIREBASE_PROJECT_ID` = `ddfashion-36025`
- `FIREBASE_CLIENT_EMAIL` = *(Firebase Service Account client_email)*
- `FIREBASE_PRIVATE_KEY` = *(Firebase Service Account private_key)*

### EmailJS Variables (Replaces Gmail SMTP)
- `EMAILJS_SERVICE_ID` = *(Your EmailJS Service ID, e.g., service_xxxxxxx)*
- `EMAILJS_TEMPLATE_ID` = *(Your EmailJS Template ID, e.g., template_xxxxxxx)*
- `EMAILJS_PUBLIC_KEY` = *(Your EmailJS Public Key)*
- `EMAILJS_PRIVATE_KEY` = *(Your EmailJS Private Key / Access Token for server-side REST API authentication)*

### Optional Role Variables
- `ADMIN_MASTER_EMAIL` = `sailate449@gmail.com`
- `ADMIN_STAFF_EMAIL` = `staff@gmail.com`

## EmailJS Dashboard Security Setting (Important for Server-Side Calls)
In your EmailJS Dashboard -> **Account** -> **Security**:
1. Enable **"Allow EmailJS API for non-browser applications"**.
2. Copy the **Private Key** and set it as `EMAILJS_PRIVATE_KEY` in Netlify Environment Variables.

## Manual Deployment to Netlify

Extract the ZIP and use the `DD_Fashion_Updated_Project-v4` folder as the project root. The current production frontend still depends on Netlify Functions for OTP, order, rewards, secure ImageKit uploads and Admin actions. Cloudflare Stage 2/3 routes are included for Preview validation only; frontend calls have not been switched. A static drag-and-drop deploy that only uploads the HTML/assets may NOT publish the serverless functions. Use a Git-connected Netlify deploy or Netlify CLI from the extracted project root so the `netlify/functions` directory is bundled:

```bash
npm install
npx netlify-cli deploy --dir=. --functions=netlify/functions
```

The command above creates a draft deploy. Only add `--prod` after the draft has passed testing and you explicitly decide to publish it to Production. Link the CLI to the intended Netlify site first; do not accidentally select the Testing site or a different Production site.

## Purchase-based Cashback / Discount Rewards

The Reviews & Points admin panel now also contains Purchase Cashback / Discount Tiers. Configure each tier with:
- Purchase threshold in Ks (based on the customer's cumulative completed-order total)
- Reward type: Cashback (Ks) or Discount (%)
- Reward value

A tier is earned once per customer when a new order is changed to `completed` by an authorized admin. Pending orders do not count. The backend uses a per-order marker to prevent duplicate credits if an order is saved or its status is toggled more than once. Customer account data stores cumulative completed spend, completed order count, cashback balance, earned tier IDs, and reward history. Cashback is stored in a server-managed wallet and may be applied at Checkout subject to the Admin-configured minimum payable amount.

Deploy `netlify/functions/store-data.js` with the rest of the project. The single active Netlify backend is under `netlify/functions/`.

## ImageKit image uploads

Production uploads are stored under the ImageKit `/production/` folder. The storefront uploads Product images, Promotion banners and extra banner images, payment QR images, and customer review photos to ImageKit through a server-side upload proxy. Payment slips remain private in the order flow. Existing image URLs and previously saved Base64 images remain readable; no existing Firestore image data is deleted or migrated automatically.

Add these Netlify environment variables (Site configuration → Environment variables):

- `IMAGEKIT_PUBLIC_KEY` — ImageKit Public Key
- `IMAGEKIT_PRIVATE_KEY` — ImageKit Private Key (server-side only; never put it in `index.html` or expose it to customers)
- `IMAGEKIT_URL_ENDPOINT` — ImageKit URL Endpoint, for example `https://ik.imagekit.io/your_imagekit_id`

Deploy the whole project so `netlify/functions/imagekit-upload.js` is published. The `imagekit-upload` function verifies the Firebase ID token, enforces Customer review folders (`/production/reviews/{uid}/{productId}`), enforces Admin-only asset folders (`/production/products`, `/production/promotions`, `/production/payment-qr`), and validates image MIME type and a 4MB maximum size before forwarding the file to ImageKit. The private key remains server-side.

After adding or changing environment variables, trigger a new Netlify deploy. Test each upload type with a small image before using it in production. Existing Firebase Storage configuration is not required for these new uploads.

Payment slip screenshots are intentionally left in the existing order submission/storage flow rather than uploaded to the public ImageKit CDN, because they can contain private transaction details. Payment QR codes are public store assets and are uploaded to ImageKit.


## Rewards & Firestore security hardening

- Customer reward balance, lifetime earned points, purchase spend/count, cashback balance, earned purchase tier IDs and reward history are server-managed fields; client writes are blocked by Firestore Rules.
- Review reward claims are stored in a permanent server-only `review_reward_claims` collection. Deleting/moderating a review does not reset its one-time points claim.
- Reward redemption is authenticated, transaction-based, request-idempotent, and writes the balance change, coupon, and ledger entry atomically. Coupon codes are high-entropy and tied to the redeeming UID.
- Reward coupon validation checks the signed-in owner and used state. Checkout validates ownership and single-use status again inside the order transaction.
- Checkout derives product prices and stock from Firestore, checks stock and deducts it atomically, and binds signed-in orders to the verified Firebase UID. Guest orders are kept separate from registered-user reward accounts.
- Firestore blocks direct client writes to reviews, orders, points ledgers, reward claims, coupon records, and purchase reward markers. Customers can read only their own orders, points ledger, coupons, and purchase reward ledger.
- Completed orders and orders with purchase-reward markers cannot be deleted; completed orders cannot be rolled back or have their customer/amount changed through the normal admin save action, to prevent duplicate or orphaned rewards.

Deploy the updated `firestore.rules` to Firebase and deploy the Netlify Functions with the project. These are source-code changes only; they are not automatically deployed to your live Firebase or Netlify site. Full refunds for completed orders are supported through the authenticated Admin action `admin_refund_completed_order` (requires `orderId` and a reason). It reverses that order's recorded cashback and earned purchase-tier IDs, updates cumulative spend/order count, and writes a reversal ledger entry. The reversal is blocked if the cashback balance is already insufficient. Refunded orders cannot be re-completed or deleted.

## Review Points: one reward per customer per product

The `customer_add_review` server action now uses a stable customer+product reward claim and checks existing `review_reward_claims` and `reviews` records for prior rewards before granting points. The permanent claim marker is retained even if a review is edited or deleted, preventing a second review-points award for the same customer account and product. A customer can still earn review points for a different product.

Deploy the full Netlify project and deploy Firestore indexes as well as rules (`firebase deploy --only firestore:rules,firestore:indexes,storage`). This source update does not change points already credited to customer balances and does not automatically refund duplicate points previously granted. Review duplicate historical balances separately before making any manual adjustment.


## Verified-purchase review points (review before or after purchase)

Customers may submit a review for any product, including before buying it. Reviews submitted before purchase are saved with `rewardPending: true` (for eligible 4/5-star reviews) and earn no points immediately. When an authorized server-side order update changes a registered customer's order to `completed`, the backend checks that order's product IDs and automatically awards points for any matching pending review. Reviews submitted after purchase are checked against existing server-stored completed, non-refunded orders and can earn points immediately. In both paths, only the exact purchased product qualifies; pending/cancelled/refunded/guest/unrelated orders do not qualify. A permanent customer+product claim and transaction prevent duplicate rewards from repeated reviews or repeated order-completion requests. The customer can review other products too, but only earns points for a product actually purchased and completed. The active Netlify deployment uses `netlify/functions/store-data.js`. Existing balances are not automatically adjusted.


## Admin-managed coupon expiry and refund review-point reversal

The Rewards & Review Points dashboard now includes:
- Reward coupon validity in days (`0` means no expiry; maximum 3650 days). New reward coupons receive an `expiresAt` timestamp when issued. Both coupon validation and final checkout reject expired coupons. Existing coupons without `expiresAt` remain valid, preserving prior behavior.
- A switch to reverse review points when the verified purchase order is refunded (enabled by default).
- A switch to keep the review after refund (enabled by default). When kept, the review remains visible but its Verified Purchase marker is removed. When disabled, the review is hidden after refund.
- An Admin-only Completed Order Refund form. Enter the Order ID and reason to invoke the server-side refund action.

When review points have already been spent before a refund, the system sets the spendable points balance to zero and records the shortfall as `pointsDebt`. Future review-point earnings and positive Admin point adjustments pay down this debt before increasing spendable points. Reward redemption is blocked while a points debt remains. The reversal is recorded in `points_ledger` and the permanent review claim remains marked as reversed, so the same customer/product pair cannot farm the reward again.

Deploy `netlify/functions/store-data.js`, the updated `index.html`, and updated Firestore Rules. Admin dashboard settings are saved to `store_config/reward_settings`. These source changes do not deploy themselves to Firebase or Netlify.


## Customer Email + UID uniqueness

- Firebase Authentication is the source of truth: Firebase Auth enforces one account per normalized email and assigns a globally unique UID.
- On OTP-verified registration, the backend stores the immutable pair in `users/{uid}` and a server-only `email_uid_map/{sha256(normalizedEmail)}` document.
- `email_uid_map` is inaccessible to clients through Firestore Rules. Registration writes the mapping transactionally; if mapping fails, the just-created Auth account is cleaned up.
- Existing accounts are backfilled into the same mapping on their next authenticated session. A conflicting email/UID pair is rejected rather than silently reassigned.
- Customers can see and copy their Firebase UID in their Profile modal.
- No UID is generated by the browser or accepted from client registration input.

## Admin Product Save Reliability Update
- Product create/update now waits for the authenticated Netlify `store-data` function to confirm the Firestore write before updating local product state, closing the editor, or showing success.
- Failed saves keep the product editor open and show an error; the submit button is disabled while saving to prevent duplicate submissions.
- Product deletion continues to wait for the server response before removing the item from local state.
- Quick Shop / Coming Soon section changes also wait for server confirmation before showing success.
- Deploy `netlify/functions/store-data.js` with the site. No Firebase Rules or Index changes were required for this product-save reliability update.


## Production deployment reminder
Until Cloudflare backend routes are ported and verified, deploy this package only to a Cloudflare Preview/staging project; keep the existing Production Netlify site active (not the Testing site). Keep the Production site environment variables already configured for Firebase Admin, EmailJS, ImageKit, and admin roles. Do not copy Testing credentials into Production. The ImageKit Private Key remains server-side in the current Netlify environment variables; add the corresponding Cloudflare Secret only when preparing the Cloudflare backend.

## Cashback Wallet (Customer Checkout)
- Customers who are logged in can enter the exact Cashback amount they want to use at checkout.
- The server validates the wallet balance and order total, deducts Cashback in a Firestore transaction, and records each use in `cashback_ledger`.
- Customers can view their current balance, total earned, total used, and recent Cashback activity in the Rewards modal.
- When an order using Cashback is refunded, the used Cashback is restored once; the refund restoration is recorded in the wallet ledger.
- No Cashback can be used by guest accounts.


## Reward Coupon usage control (added)
- Admin > Reward Settings includes a switch to enable/disable customer use of Reward Coupons.
- The setting is enforced server-side when an order is created; hiding/disabling only in the browser is not relied upon.
- One coupon code field is accepted per order, so Reward Coupons cannot be stacked with another coupon in the same order.
- A Reward Coupon is marked used in the same Firestore transaction that creates the order.

## Remaining configuration before final production release
- Directly spending a chosen number of Rewards Points at checkout is not included in this build yet. The Points-to-Kyat conversion rule must be specified before it can be implemented safely. Existing Points-to-Reward-Coupon redemption remains available.


## Production hardening added in this release

- Checkout Points redemption is server-calculated and transactionally deducted. Admin controls whether it is enabled and the number of points required for each 1,000 Ks discount. Default is disabled until Admin enables it; default conversion is 100 Points = 1,000 Ks.
- Admin controls the minimum payable amount (default 1,000 Ks). Server rejects any checkout that would fall below this minimum after coupon, Points and Cashback.
- Pending/failed order cancellation restores stock, used Reward Coupon and used Points/Cashback once, using an idempotent server transaction. Completed orders must use the existing refund workflow.
- Completed-order refunds restore Points/Cashback spent at checkout, in addition to the existing reward reversal logic.
- `validate_coupon` now checks the Admin Reward Coupon enable/disable switch.
- Product `costPrice` is migrated from public product documents into private `product_costs` records through Admin-only `admin_get_product_costs`; public order items no longer include cost price. Admin-only cost data is loaded for the Admin profit UI.
- Firebase Storage rules are linked in `firebase.json`. Deploy using `firebase deploy --only firestore:rules,firestore:indexes,storage,storage`.
- ImageKit uploads are proxied through `imagekit-upload` so the server enforces the `/production/` folder and allowed purposes. Maximum image size is 4MB; supported formats are JPEG, PNG and WebP.
- Run `npm test` for offline syntax and structural smoke checks. These tests do not replace live Firebase/Netlify integration tests.

### Important deployment order

1. Back up Firestore data and existing Netlify environment variables.
2. Deploy Firestore rules/indexes and Storage rules.
3. Deploy the complete Netlify project (including `netlify/functions/`).
4. Before directing customers to the updated site, sign in as Admin once and allow the Admin dashboard to run `admin_get_product_costs`; this migrates legacy `costPrice` fields into the private collection and strips them from public product/order documents. Until this one-time migration runs, legacy Firestore documents may still contain old public `costPrice` fields.
5. In Admin Reward Settings, set the Minimum Payable amount and points conversion. Keep Checkout Points disabled until the conversion is reviewed and explicitly enabled.
6. Test with a test customer: coupon min purchase/scope/cap, Points use, Cashback use, combined minimum payable, pending cancellation restore, completed refund restore, review upload, product upload, promotion upload and payment QR upload.

No live Firebase or Netlify deployment is performed by this ZIP build.

## Product data integrity update (2026-11-05)
- Admin `save_product` now validates product name, price, stock, and ImageKit asset URL metadata before writing.
- Product edits are rejected while a product is marked as deleting; deleted product IDs remain blocked by the tombstone registry.
- Legacy `sync_local_products` is now create-only: it skips IDs already present in Firestore, tombstoned IDs, and records marked deleting/deleted. It no longer overwrites current server product data with stale browser localStorage values.
- Only one copy of the Netlify backend is retained: `netlify/functions/`.
- Automated local tests cover syntax, checkout/financial safety, Coming Soon order blocking, and product lifecycle guards.

Important scope note: these checks are local automated tests only. They do not prove live Firebase/ImageKit behavior. A complete operational backup/restore UI, scheduled orphan-image cleanup worker, automated delete retry worker, upload rate limiting, and live provider integration tests are not included in this update. Failed product deletion remains marked for manual/admin retry; do not treat the system as gap-free until those components are implemented and verified in a separate staging environment.

## Orphan Image Cleanup (Admin)
- Admin > Products includes **Unused Images**.
- Preview scans ImageKit `/production/products/` and Firestore document data (including nested subcollections) for referenced ImageKit URLs and `fileId` values.
- Only unreferenced product-folder files older than 7 days are listed. Admin must confirm before deletion.
- The delete action performs a fresh server-side reference scan and deletes only explicitly confirmed candidate file IDs (maximum 100 per request); results are written to `product_delete_audit`.
- This is an on-demand cleanup, not an automatic scheduled deletion. Live ImageKit/Production integration has not been executed as part of local tests.
