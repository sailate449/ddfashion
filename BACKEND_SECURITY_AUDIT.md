# DD Fashion Backend Security Hardening

Baseline: `DD_Fashion_Backend_Security_Audit_Update.zip` (which was based on `DD_Fashion_Lifetime_Cashback_Only_Update.zip`).

## Implemented in this update

### 1. Customer Chat isolation
- Replaced the customer-facing shared `store_config/chats` write path with a server-mediated `customer_chats/{uid}` data model.
- Chat API verifies Firebase ID tokens and binds customer read/send/mark-read operations to the token UID.
- Admin chat listing and admin replies require the current server-managed Firestore user profile role (`admin_master` / `admin_staff`).
- Chat messages are length-limited, control characters are stripped, and UI rendering escapes HTML to prevent message-based script injection.
- Old shared `store_config/chats` is no longer customer-readable or writable. Admin-side best-effort migration imports legacy threads whose stored display name is an email address; unmappable legacy threads remain in the legacy document for manual review.
- The customer chat UI requires login to send or view cloud chat history. It refreshes from the server every five seconds; the former global Firestore document listener/write was removed for customers.

### 2. OTP concurrency / replay protection
- EmailJS delivery remains unchanged as requested.
- OTP send now reserves the email challenge and IP/email hourly quotas in one Firestore transaction. Concurrent requests cannot pass the same counters based on stale reads.
- OTP verification checks expiry, increments wrong-attempt counters, and claims a valid OTP in one Firestore transaction.
- A successful login/register/reset completion is marked as processing/consumed before downstream account operations, preventing concurrent replay.
- Password reset's first verification step remains available for the existing two-step UI; the challenge is retained as verified until the password update step consumes it.

### 3. Admin authorization consistency
- Firestore Rules, Storage Rules, Admin API actions, and ImageKit admin uploads now use the server-managed `users/{uid}.role` profile as the authorization source.
- Firestore Rules no longer contain a separate hard-coded admin email list.
- Admin API actions no longer accept a stale custom role claim or a separate environment allowlist as authorization by itself.
- `user-session` continues to assign/synchronize the profile role from the deployment's `ADMIN_MASTER_EMAIL` / `ADMIN_STAFF_EMAIL` configuration. Those environment values remain the provisioning source; the Firestore profile is the common authorization record used by Rules and backend operations.

## Tests performed
- `npm test` passed, including the existing suite and the new Chat + OTP security regression test.
- Node syntax checks passed for changed backend JavaScript files.
- Mirrored `functions/` and `netlify/functions/` backend files were synchronized.
- Inline browser scripts were parsed by the existing smoke test.

## Deployment / verification notes
- Deploy the full ZIP so the new `chat-data` Netlify Function and Firestore/Storage Rules are included.
- Publish the updated Firestore and Storage Rules with Firebase CLI/Console; deploying website files alone does not update Firebase Rules.
- Customer cloud Chat now requires Firebase sign-in. This is intentional so each conversation is bound to a verified UID.
- Legacy chat migration is best-effort for old threads whose `name` contains the customer's email. Unmatched legacy threads are not deleted.
- No production Firebase project, live Netlify deployment, EmailJS delivery, or real concurrent OTP load test was run in this environment. Automated source/regression tests do not prove production security by themselves.
