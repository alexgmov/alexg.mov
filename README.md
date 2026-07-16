# alexg.mov Website

This repository is the alexg.mov marketing site and digital product shop. It is a Vite/React single-page app with Vercel-style API handlers for analytics, Stripe Checkout, webhook fulfillment, Sidestream release checks, and private download delivery.

## Runtime Architecture

- `site/main.jsx` boots the React app, first loading shared browser modules such as analytics, product data, SEO helpers, visuals, and chrome. `site/seo.jsx` owns canonical, Open Graph, Twitter card, and JSON-LD metadata; the default social share image is `mockups/alexg-og-card.png`, while LUT detail pages can override that with product mockups.
- `site/app.jsx` owns the query-string router. Public pages are represented by `?page=...`, for example `?page=luts`, `?page=lut:cinematic-01`, `?page=sidestream-install`, and `?page=success`.
- Route components are split into chunks: home, plugins, LUTs, and supporting pages.
- `site/chrome.jsx` owns global nav/footer chrome. The mobile bottom nav is hidden on product detail routes and the Sidestream install guide so purchase/install actions are not covered by the floating menu.
- `site/home.jsx` owns the homepage hero, hero shortcuts to LUTs/portfolio, and featured product rail, with the OMI proof teaser leading the LUT cards. `site/pages.jsx` owns portfolio/services pages, keeps the service case-study fallback copy, and uses opt-in `data-portfolio-scroll-blur` markers only on portfolio content that should blur while the top category header stays crisp.
- `site/travel.js` owns the homepage travel itinerary. Each row has a `startsOn` ISO date; the browser derives `past`, `here`, and `next` statuses from the current date in the `America/Los_Angeles` timezone.
- `site/product-data.js` mirrors public product data for the browser. It contains display copy, SEO data, product IDs used by checkout buttons, display pricing fields, media paths, and product page metadata. LUT copy also has fallback/indexable mirrors in `site/luts.jsx`, `site/home.jsx`, and `llms.txt`; keep those aligned when changing product descriptions.
- `site/pricing.jsx` owns display-only pricing helpers for rendered prices, compare-at launch pricing, and pricing-variant tracking attributes. Stripe Price IDs in `lib/products.js` remain the source of truth for what checkout actually charges.
- `site/visuals.jsx` owns reusable visual previews such as `LutPreview`. `site/media.js` owns responsive video helpers plus the constrained in-app browser detector; LUT previews render poster-based before/after layers in TikTok/Instagram-style WebViews so autoplay preview videos cannot jump into native fullscreen.
- `lib/products.js` is the server-side commerce catalog. This is the only product catalog used for Stripe Checkout and fulfillment.
- `api/*.js` and nested `api/**/*.js` files are Vercel-compatible CommonJS handlers. Locally, `server.js` maps those same files to `/api/...` routes and attaches small `res.status()`, `res.json()`, and `res.send()` helpers.
- `server.js` serves Vite middleware in development and the `dist/` build in production mode.
- `scripts/copy-static.mjs` copies static assets that Vite does not bundle directly, including `mockups`, `videos`, `robots.txt`, `sitemap.xml`, and `llms.txt`.
- `api/sidestream/releases/latest.js` is the compatibility endpoint used by older Sidestream panels. It returns a validated `200` copy of the canonical `sidestream.tv` manifest for Mac and Windows; it must not redirect because the v1.0.11 updater rejects non-2xx responses. `data/sidestream-release-manifest.json` remains only as legacy shop/download metadata and no longer controls update checks.

## Local Commands

```sh
npm run dev
npm run build
npm run preview
npm run test:sidestream-release-manifest
npm run release:publish-manifest -- --version 1.0.5 --artifact /path/to/Sidestream-1.0.5-Mac-Installer.dmg --artifact-url 'https://9kfjhekmxi6iiwni.private.blob.vercel-storage.com/sidestream/1.0.5/Sidestream-1.0.5-Mac-Installer.dmg?download=1' --release-notes-url 'https://alexg.mov/?page=sidestream-install' --signed --verified --uploaded --smoke-tested
```

`npm run dev` starts the local Node server and Vite middleware on `PORT` or `3000`. `npm run build` runs `vite build` and then copies static assets into `dist/`.

## TODO

- Make the Services testimonials section happy later, then uncomment `ServiceTestimonials` in `site/pages.jsx`.

## Environment Variables

Commerce and fulfillment use these variables:

- `SITE_URL`: canonical public origin. Defaults to `https://alexg.mov`.
- `STRIPE_SECRET_KEY`: server-side Stripe key used to create and inspect Checkout Sessions.
- `STRIPE_WEBHOOK_SECRET`: webhook signing secret for `/api/webhook`.
- `STRIPE_PRICE_SOLENE`: Stripe Price ID for the MERIDIAN/Solene checkout product.
- `STRIPE_PRICE_ONYX`: Stripe Price ID for the ONYX checkout product.
- `STRIPE_PRICE_HALOCLYNE`: Stripe Price ID for the HALOCLYNE checkout product.
- `STRIPE_PRICE_COMPLETE_LUT_BUNDLE`: optional Stripe Price ID override for the Complete LUT Bundle checkout product. Leave unset to use the checked-in $9.75 one-time Price.
- `STRIPE_PRICE_SIDESTREAM`: optional Stripe Price ID override for the Sidestream plugin checkout product. Leave unset to use the checked-in temporary $0 Sidestream Price while the product is free.
- `MERIDIAN_BLOB_URL`: optional private Vercel Blob URL override for MERIDIAN.
- `ONYX_BLOB_URL`: optional private Vercel Blob URL override for ONYX.
- `HALOCLYNE_BLOB_URL`: optional private Vercel Blob URL override for HALOCLYNE.
- `COMPLETE_LUT_BUNDLE_BLOB_URL`: optional private Vercel Blob URL override for the Complete LUT Bundle ZIP.
- `SIDESTREAM_RELEASE_MANIFEST_PATH`: optional path override for the legacy manifest publish script. It does not control the compatibility update endpoint.
- `DOWNLOAD_SECRET`: HMAC secret used to sign expiring download links.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token used by `/api/download` to fetch private product files.
- `SIDESTREAM_BLOB_READ_WRITE_TOKEN`: Vercel Blob token used by `/api/download` for Sidestream when its release DMG lives in a separate Blob store from the LUT products.
- `SIDESTREAM_PUBLIC_DOWNLOAD_URL`: optional public Sidestream installer URL. Defaults to `https://sidestream-xi.vercel.app/api/download` and is used so the free installer does not depend on the shop signed-link/blob-token path.
- `RESEND_API_KEY`: Resend key used by the webhook fulfillment email and first-visit promo code email.
- `FIRST_VISIT_OFFER_FROM`: optional sender override for the promo code email. Defaults to `alexg.mov <downloads@alexg.mov>`.
- `FIRST_VISIT_OFFER_REPLY_TO`: optional reply-to override for the promo code email. Defaults to `alex@alexg.mov`.
- `FIRST_VISIT_OFFER_UNSUBSCRIBE_EMAIL`: optional unsubscribe reply address override. Defaults to `FIRST_VISIT_OFFER_REPLY_TO`.
- `FIRST_VISIT_OFFER_EMAIL_ENABLED`: set to `0` to disable the promo code email while keeping the on-site code reveal active.
- `FIRST_VISIT_OFFER_SECRET`: optional HMAC secret for first-visit offer tokens. Falls back to `DOWNLOAD_SECRET`, then `STRIPE_SECRET_KEY`, then the dev fallback in `lib/first-visit-offer.js`.
- `EMAIL_POSTAL_ADDRESS` or `BUSINESS_POSTAL_ADDRESS`: footer address to include for commercial email compliance.
- `ANALYTICS_LOG_DIR`: optional local analytics log directory.
- `ANALYTICS_SALT`: optional visitor fingerprint salt. Falls back to `DOWNLOAD_SECRET`.
- `POSTGRES_URL`, `DATABASE_URL`, or `SUPABASE_POSTGRES_URL`: optional Supabase/Postgres pooled connection string used for durable business logging. Prefer Supabase's shared pooler URL on Vercel, with the real password stored only in Vercel/local env vars.
- `SUPABASE_URL`: optional Supabase project URL used with `SUPABASE_SECRET_KEY` for server-only Sidestream telemetry writes when the Postgres pooler URL is unavailable.
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`: optional server-only Supabase REST key for Sidestream telemetry. Never expose this to browser code or the Sidestream CEP extension; it bypasses RLS and belongs only in trusted backend env vars.
- `POSTGRES_POOL_MAX`: optional server-side Postgres pool size. Defaults to `3`, which is intentionally small for Vercel serverless.
- `POSTGRES_SSL`: set to `0` only for a local non-SSL Postgres. Supabase pooler connections should keep SSL enabled.
- `SIDESTREAM_TELEMETRY_ENABLED`: set to `0` to make `/api/plugin-telemetry` accept but drop Sidestream plugin telemetry while keeping the route deployed.

Never expose Stripe secret keys, webhook secrets, Resend keys, Blob tokens, or `DOWNLOAD_SECRET` in frontend files.
Never expose the Supabase pooler password, Postgres URL, secret/service-role key, or any server database credential in frontend files or the Sidestream CEP extension.

## Sidestream Release Manifest

`api/sidestream/releases/latest.js` serves `GET /api/sidestream/releases/latest?channel=stable&platform=darwin-arm64&version=1.0.11` for already-installed Sidestream panels. The v1.0.11 client does not follow HTTP redirects and prefers `releaseNotesUrl` when its Install button is clicked, so this route fetches `https://sidestream.tv/api/releases/latest` server-to-server, returns the validated manifest directly with `200`, and maps the legacy Mac release-notes field to the canonical `/api/download` URL. The request's stable channel, supported platform, and current version are forwarded; the client can therefore move directly from v1.0.11 to the latest installer instead of stopping at v1.0.12 or requiring an extra landing-page click.

The bridge supports Mac DMGs for `darwin-arm64`, `darwin-x64`, and platformless legacy requests, plus the exact `win32-x64` Windows route. Mac artifacts must resolve to `https://sidestream.tv/api/download`; Windows artifact and release-note URLs must resolve to `https://sidestream.tv/api/download?platform=win32-x64`. Invalid payloads, redirects, unsupported platforms, oversized responses, upstream errors, and timeouts fail closed. The endpoint does not require or accept install identity, support code, email, telemetry payloads, Stripe state, or signed purchase links.

Canonical release truth lives in `/Users/alexgarrett/alexg.mov/website/sidestream/data/release-manifest.json` and is served by `sidestream.tv`. The checked-in `data/sidestream-release-manifest.json` in this repo remains legacy shop/download metadata; updating it does not change what old panels see through the compatibility endpoint. If that legacy snapshot needs to be refreshed, publish it only after the release package is complete:

1. Build/sign/notarize the native Mac installer DMG from the FlowState repo.
2. Verify the signed package and smoke-test the install.
3. Upload the release artifact to Vercel Blob. The current store is private-only, so use the returned private Blob URL as `--artifact-url` unless a public downloads host has been restored.
4. Run `npm run release:publish-manifest -- --version <x.y.z> --artifact <local dmg> --artifact-url <https blob url> --release-notes-url 'https://alexg.mov/?page=sidestream-install' --signed --verified --uploaded --smoke-tested`.
5. Run `npm run build` before committing the website change.

The publish script calculates `sha256` and `sizeBytes` from the local artifact and refuses to write the legacy snapshot unless all four release gates are passed as flags. Staged rollout remains canonical Sidestream manifest data; the panel makes the actual eligibility decision locally so the compatibility endpoint does not need to track users.

## Supabase Business Ledger

The optional Supabase integration uses server-side database writes through `lib/supabase-db.js`. Commerce/ledger helpers use direct Postgres when a pooled Postgres URL is configured. Sidestream telemetry prefers server-only Supabase REST with `SUPABASE_URL` plus `SUPABASE_SECRET_KEY`, then falls back to direct Postgres when the REST key is absent. Browser code and the Sidestream CEP panel never receive database credentials.

The initial schema lives in `supabase/migrations/20260521095933_create_business_ledger.sql` and creates private ledger tables for:

- `customers`: normalized customer emails, Stripe customer IDs, country/name when Stripe provides them, and small metadata.
- `email_leads`: first-visit offer captures with visitor/session hashes and storage targets.
- `checkout_sessions`: Stripe Checkout Session snapshots created by `/api/create-checkout` and refreshed by the webhook.
- `stripe_events`: received Stripe webhook events and processing status.
- `purchases`: one row per fulfilled Checkout Session.
- `licenses`: active product/license entitlement rows tied to purchases and Checkout Sessions.
- `download_links`: generated fulfillment links, stored as hashes rather than raw signed URLs.
- `download_events`: signed download-link outcomes such as served, expired, invalid signature, missing product, or Blob fetch failure.
- `sidestream_telemetry_events`: redacted, batched Sidestream CEP telemetry events posted through `/api/plugin-telemetry`.
- `sidestream_installs`: latest known app/runtime/support state per hashed Sidestream install and support code.
- `sidestream_sessions`: session start/end rollups, app/runtime summary, event counts, and latest error/action context.

All new tables have RLS enabled and no public policies. The app writes through the server-side pooled Postgres credential or the Supabase `service_role` REST key only. The Sidestream rollup migration explicitly grants `service_role` table access for the REST writer while keeping `anon` and `authenticated` revoked.

The Sidestream telemetry schema starts in `supabase/migrations/20260521101823_add_sidestream_plugin_telemetry.sql`. The richer automatic logging rollup migration lives in `supabase/migrations/20260612120000_add_sidestream_telemetry_rollups.sql` and adds support-code/category/error/action columns plus install/session summary tables. Keep Sidestream telemetry migrations separate from the commerce ledger migration so plugin event volume can be indexed and retained independently from customer, purchase, and license tables.

Apply the migration from the Supabase SQL editor or with the Supabase CLI after linking the project. For direct Postgres writes, set the Vercel env var to the Supabase pooler connection string with the real password, for example:

```sh
POSTGRES_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

## Sidestream Plugin Telemetry

`api/plugin-telemetry.js` accepts `POST /api/plugin-telemetry` from the Sidestream CEP extension and the native Mac installer postinstall script. The plugin sends batches of up to 100 already-redacted events; the installer sends a single best-effort `installer_install_completed` event with a pseudonymous `installer_receipt_id_hash`. The server validates body size, event field lengths, timestamps, category/severity labels, structured consent state, and JSON payload size. It hashes request IP/user-agent context with the server secret, writes raw redacted rows to `sidestream_telemetry_events`, and upserts `sidestream_installs` plus `sidestream_sessions` through `lib/supabase-db.js` when events carry normal panel install/session ids.

Telemetry recording prefers the server-only Supabase REST path when `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are configured. If the richer telemetry migration has not been applied yet, the REST writer retries against the legacy `sidestream_telemetry_events` columns so raw redacted events are still recorded; install/session rollups begin once the migration and Supabase schema cache include the new tables/columns. If the REST key is absent, telemetry falls back to the Postgres pooler path.

The route returns `200` only when every accepted event is recorded or already present from an earlier retry. Database misconfiguration, partial writes, or collector errors return non-2xx so the CEP uploader keeps the local queue and retries. `SIDESTREAM_TELEMETRY_ENABLED=0` remains an intentional accept-and-drop kill switch and returns `202` with `disabled: true`.

The event envelope supports `support_code`, `batch_id`, `payload_redaction_version`, `event_category`, `severity`, `error_class`, and `action_name` for dashboards that can query installs, native installer receipts, sessions, timelines, failures, update-check outcomes, and support lookups without exposing raw URLs, local paths, filenames, titles, channels, queries, command output, stacks, cookies, clipboard content, or Supabase credentials.

The route intentionally does not expose Supabase, Stripe, Blob, or Resend secrets to the plugin. If Supabase is not configured, the route fails the telemetry acknowledgement instead of claiming success; the editor's search/download workflow continues because uploads happen through the plugin's bounded background queue.

## First-Visit Promo Offer

`site/app.jsx` renders the first-visit LUT promo prompt and stores its local state in `localStorage` under `alexgmov:firstVisitOffer:v1`.

The `Unlock` button is intentionally instant:

1. The browser validates the email format.
2. The browser immediately saves `{ state: 'claimed', code: 'HIFRIEND', email, captureStatus: 'pending' }`, shows the code, and tries to copy it.
3. `site/app.jsx` sends `POST /api/email-capture` in the background.
4. `api/email-capture.js` stores the lead, sends the promo email when configured, creates the signed offer token, logs analytics, and returns `{ code, offerToken }`.
5. When the background request succeeds, the browser updates the saved offer token and marks `captureStatus: 'synced'`. If it fails, the visible code remains usable and local state records `captureStatus: 'failed'`.

Checkout buttons in `site/luts.jsx` and `site/plugins.jsx` pass `offerCode`, `offerEmail`, and `offerToken` from the browser helpers exposed by `site/app.jsx`. `api/create-checkout.js` uses a valid saved offer claim only to prefill the Checkout email. It always sends `allow_promotion_codes: true` so Stripe-hosted Checkout shows the manual promotion-code field for codes such as `HIFRIEND` or one-off comp codes. Do not also send a `discounts` array for the first-visit offer unless you intentionally want Stripe to hide the manual promo-code field.

## Stripe Checkout Flow

1. A product detail page calls `POST /api/create-checkout` with a `productId`.
2. `api/create-checkout.js` validates the product against `lib/products.js`.
3. Checkout fails closed if the product is unknown, the Stripe secret is missing, the product has no `stripePriceId`, or the product has no `blobUrl`.
4. The handler creates a Stripe Checkout Session in `payment` mode with one Price ID from the server catalog.
5. The Checkout Session metadata stores `{ productId }` plus a sanitized optional `pricingVariant` for pricing-display experiments. The webhook depends on `productId` for fulfillment; the client-provided pricing variant is analytics-only and never controls the charged amount.
6. `allow_promotion_codes: true` enables Stripe's promotion-code entry field on the hosted Checkout page.
7. `success_url` returns the buyer to `/?page=success&session_id={CHECKOUT_SESSION_ID}`.
8. `cancel_url` returns the buyer to the product page declared in `product.page`.
9. `statement_descriptor_suffix` is set when the product defines `statementDescriptorSuffix`.
10. The server logs a `checkout_session_created` analytics event.
11. If `POSTGRES_URL` is configured, `lib/supabase-db.js` records the Checkout Session snapshot in Supabase.
12. The browser redirects to the Stripe-hosted Checkout URL.

The integration intentionally uses Stripe-hosted Checkout Sessions for one-time digital purchases.

## Display Pricing

Public product entries can include optional display-only pricing fields:

- `price`: frontend display price. Stripe still charges the server-side Stripe Price ID.
- `compareAtPrice`: regular/launch anchor rendered as a crossed-out price only when it is higher than `price`.
- `priceLabel`: small supporting label such as `75% off`.
- `priceNote`: product-detail reassurance copy beside the price.
- `pricingVariant`: optional stable analytics label. If omitted, `site/pricing.jsx` derives labels such as `launch-29-18`.

The current LUT sale pricing pattern is 75% off the previous checkout price: individual LUTs show `$18` compare-at and `$4.50` current price with `pricingVariant: 'sale-75-off-individual-lut'`; the Complete LUT Bundle shows `$39` compare-at and `$9.75` current price with `pricingVariant: 'sale-75-off-complete-bundle'`. Stripe checkout must point at matching one-time Prices: `STRIPE_PRICE_SOLENE`, `STRIPE_PRICE_ONYX`, `STRIPE_PRICE_HALOCLYNE`, and `STRIPE_PRICE_COMPLETE_LUT_BUNDLE`. Do not invent fake high anchors such as `$99` unless that was a real bona fide price or a defensible planned regular price. Sidestream remains visually free while its checked-in Stripe fallback is a temporary $0 Price; do not display `$18` for it until `STRIPE_PRICE_SIDESTREAM` points at a real paid Price.

## Checkout Success Page

The success page does not fulfill the order. It only confirms the completed Stripe session for the browser:

1. `site/pages.jsx` reads `session_id` from the URL.
2. It calls `GET /api/checkout-session?session_id=...`.
3. `api/checkout-session.js` retrieves the Checkout Session from Stripe.
4. If `payment_status` is neither `paid` nor `no_payment_required`, it returns `402`.
5. If complete, it returns the customer email and product name for confirmation copy.

Download email delivery is handled by the Stripe webhook, not by this page.

## Product Fulfillment Protocol

Fulfillment is driven by the server catalog in `lib/products.js`.

Each sellable product entry must include:

- `name`: display name used in the fulfillment email.
- `stripePriceId`: Stripe Price ID, usually from an environment variable.
- `statementDescriptorSuffix`: optional card statement suffix.
- `blobUrl`: private Vercel Blob URL for the purchased file.
- `downloadFilename`: filename sent in the `Content-Disposition` download header.
- `page`: SPA route used when checkout is canceled.

The browser-side product entry must also point to the same server product key. LUT entries use `checkoutProductId`:

```js
checkoutProductId: 'onyx'
```

That value must match a key in `PRODUCTS`. Plugin detail pages currently post `p.id`, so released plugin IDs must also match a server product key. The current commerce product mapping is:

- Frontend page `lut:cinematic-01` -> checkout product `solene` -> MERIDIAN zip.
- Frontend page `lut:onyx` -> checkout product `onyx` -> ONYX zip.
- Frontend page `lut:haloclyne` -> checkout product `haloclyne` -> HALOCLYNE zip.
- Frontend page `lut:complete-lut-bundle` -> checkout product `complete-lut-bundle` -> Complete LUT Bundle zip.
- Frontend page `plugin:sidestream` -> checkout product `sidestream` -> temporary $0 Stripe Checkout -> the current Sidestream release manifest artifact plus the `sidestream-install` backup web steps.

The Complete LUT Bundle detail page is intentionally data-driven: `site/luts.jsx` builds the scroll-through included-LUT sections from every available non-bundle item in `LUTS`, with one primary before/after scrubber per released LUT and the LUT name labeled beneath that panel. When adding a future LUT, the page will show its section automatically once that LUT is available, but the bundle ZIP, Stripe Price/display price, bundle copy, `llms.txt`, sitemap, and this README still need a deliberate update so checkout and fulfillment match the page.

When adding a new product:

1. Upload the product file to Vercel Blob as a private object.
2. Add a server product in `lib/products.js`.
3. Add the Stripe Price ID, and add a Blob URL environment variable if you do not want to use the checked-in fallback URL.
4. Add or update the public product data in `site/product-data.js` and the matching route data in the route file if needed.
5. Make sure the frontend `checkoutProductId` or released plugin `id` matches the server catalog key.
6. Run a test Checkout Session and confirm that the webhook sends the email.
7. Open the emailed link before and after expiration to confirm download and expiry behavior.

Local product files can live under `plugins/` or `luts/` while they are being uploaded to Vercel Blob. Those folders are ignored so large deliverables do not get committed.

## Webhook Fulfillment Flow

`api/webhook.js` is the only automatic fulfillment path.

1. Stripe sends `checkout.session.completed` to `/api/webhook`.
2. The handler reads the raw request body and verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.
3. The webhook logs `stripe_webhook_checkout_completed`.
4. `fulfillCheckoutSession()` reads `metadata.productId` from the Stripe session.
5. Fulfillment only runs when `payment_status` is `paid` or `no_payment_required`. The second status supports Stripe no-cost orders from 100% promotion codes.
6. The product is loaded from `lib/products.js`.
7. Fulfillment requires a configured product Blob URL, customer email, and `RESEND_API_KEY`; paid product fulfillment also requires `DOWNLOAD_SECRET`.
8. `api/download.makeLink()` creates a signed URL valid for 48 hours for paid product downloads.
9. Resend sends the buyer an email from `alexg.mov <downloads@alexg.mov>`.
10. Sidestream fulfillment emails the single native Mac installer DMG download link plus backup web steps. Because Sidestream is currently free, that email uses the public Sidestream installer route instead of the signed shop download route. The DMG contains `Install Sidestream.pkg`; no external installer app is required.
11. If `POSTGRES_URL` is configured, the webhook records the Stripe event, checkout session, customer, purchase, active license, and hashed download-link row in Supabase.

Important operational detail: fulfillment errors are logged, but the webhook still responds with `{ received: true }`. That means Stripe will not retry a failed Resend send or missing-product configuration after the handler catches the error. Check deployment logs after product launches and webhook tests.

## Download Delivery

`api/download.js` serves private product files through signed links:

1. Paid product links contain `p`, `exp`, and `sig` query parameters.
2. `sig` is an HMAC-SHA256 signature over `productId:exp` using `DOWNLOAD_SECRET`.
3. Expired links return `410`.
4. Invalid signatures return `403`.
5. Missing products return `404`.
6. The handler fetches the private Blob URL with `BLOB_READ_WRITE_TOKEN`, or with a product-specific token env such as `SIDESTREAM_BLOB_READ_WRITE_TOKEN` when configured in `lib/products.js`.
7. `HEAD` requests validate the signed link and private Blob reachability, then return file headers without streaming the artifact.
8. `GET` requests stream the file as an attachment using `downloadFilename`.
9. If `POSTGRES_URL` is configured, the handler records the download outcome in `download_events`.

Sidestream is the exception while it is free: `/api/download?p=sidestream...` redirects to `SIDESTREAM_PUBLIC_DOWNLOAD_URL`, and new Sidestream checkout emails use that same public installer URL directly. This keeps old signed Sidestream email links working even if `DOWNLOAD_SECRET` or private Blob tokens drift.

Download links are generated server-side only and are currently valid for 48 hours.

## Analytics

- `site/analytics.js` records browser events such as page views, product CTA clicks, buy clicks, checkout success views, and page attention.
- `server.js` records GET requests through `trackGetRequest()`.
- `lib/analytics-store.js` stores JSONL analytics files under `.analytics` locally, or `/tmp/alexg-analytics` on Vercel.
- `/analytics` and `/analytics-dashboard` render the local dashboard.
- `api/analytics-dashboard-data.js` combines local analytics with real Stripe Checkout Session lifecycle data from `lib/stripe-analytics.js`.

Stripe-hosted Checkout does not expose internal Checkout page clicks, field focus, heatmaps, or page attention. The dashboard uses real Stripe Session lifecycle fields such as created, open, complete, expired, paid, amount, product metadata, and completion timing.

## Homepage Travel Widget

`site/travel.js` is the source of truth for the homepage location list. To update travel, add or edit rows in `TRAVEL_ITINERARY`, keep `startsOn` sorted oldest to newest, and make sure each `key` exists in the `LOCATIONS` map in `site/home.jsx`. `LOCATIONS` entries usually render as `City, Country`; country-level stops can leave `country` blank and the travel list will omit the comma suffix.

The current location is derived automatically at page load using the current date in the `America/Los_Angeles` timezone. The latest row whose `startsOn` date is today or earlier becomes `here`; earlier rows become `past`; later rows become `next`. The current open-ended stop is represented as the final row in `TRAVEL_ITINERARY`.

`HologramGlobe()` in `site/home.jsx` applies a visual +60 degree longitude rotation after centering the current location. Keep that offset separate from `LOCATIONS` latitude/longitude data so the list and date logic remain geographically correct while the planet framing can be art-directed. The globe canvas stays pointer-transparent; `site/home.jsx` positions a circular `.travel2-globe-hitarea` over the rendered sphere so pointer drag can rotate the D3 projection without blocking the travel list or content below the globe bleed.

## Recent Change Log

- 2026-07-15: Bridged legacy Sidestream update checks to the canonical `sidestream.tv` release manifest with direct `200` responses, strict Mac/Windows artifact validation, direct Mac installer routing for the legacy release-notes-first button, and v1.0.11-to-latest regression coverage so old clients are no longer stranded on the stale v1.0.8 snapshot.
- 2026-07-02: Dropped all LUT checkout prices by 75%: individual LUTs now display and charge `$4.50`, the Complete LUT Bundle displays and charges `$9.75`, Stripe Products default to the new live one-time Prices, the previous `$18`/`$39` Stripe Prices are archived, and the bundle fallback Price ID now matches the sale price.
- 2026-06-22: Allowed Sidestream telemetry event category `install` so native Mac installer receipt events keep their category when posted through `/api/plugin-telemetry`.
- 2026-06-22: Routed free Sidestream installer fulfillment through the known-good public Sidestream download endpoint, with `/api/download?p=sidestream...` redirecting old signed links there so installer access no longer depends on the shop signed-link secret or separate Blob token.
- 2026-06-22: Updated OMI proof copy to say `10M organic views` across the homepage proof teaser, portfolio tile, and service case-study fallback copy.
- 2026-06-18: Increased homepage hero shortcut label size and centered the text vertically in the text-only buttons.
- 2026-06-18: Simplified homepage hero shortcuts to text-only Buy LUTs and Portfolio buttons with arrows.
- 2026-06-18: Added a second homepage hero shortcut for Portfolio beside the existing Buy LUTs shortcut.
- 2026-06-18: Made `/api/plugin-telemetry` use strict acknowledgements: duplicate retries count as recorded, but database misconfiguration, partial writes, or collector errors return non-2xx so the Sidestream CEP queue retries instead of silently dropping dashboard facts.
- 2026-06-22: Updated Sidestream checkout/download fulfillment, release manifest, and public install copy to the `1.0.5` native Mac installer DMG, removing the retired ZXP-helper package from the customer path while keeping private Blob delivery behind signed `/api/download` links.
- 2026-06-17: Published Sidestream `1.0.3` release metadata, updated the checkout fulfillment fallback to the `1.0.3` private Blob DMG, and defaulted release-note/update clicks to the live Sidestream install guide.
- 2026-06-12: Added the Sidestream stable release manifest endpoint at `/api/sidestream/releases/latest`, a gated manifest publish script, update telemetry category support, and docs for the no-identity update-check protocol.
- 2026-06-12: Granted Supabase `service_role` access to Sidestream telemetry tables so the server-only REST writer can insert raw events and upsert install/session rollups while RLS stays enabled and public roles stay revoked.
- 2026-06-12: Added a server-only Supabase REST telemetry writer using `SUPABASE_URL` plus `SUPABASE_SECRET_KEY`, with Postgres as fallback and a legacy-schema retry so Sidestream events still record before the rollup migration is applied.
- 2026-06-12: Extended `/api/plugin-telemetry` for automatic Sidestream logging with richer redacted event envelopes, support codes, batch ids, category/severity/error/action fields, structured consent payloads, and Supabase rollups in `sidestream_installs` plus `sidestream_sessions`.
- 2026-06-09: Replaced the default Open Graph/Twitter share preview image with the branded `mockups/alexg-og-card.png` card so home/portfolio/service links no longer default to the MERIDIAN product mockup.
- 2026-06-09: Complete LUT Bundle previews now show one primary before/after scrubber per released LUT, with the LUT name labeled beneath each bundle preview panel.
- 2026-06-07: Removed the global header `Shop products` shortcut from `site/chrome.jsx`; shoppers still reach LUTs from the homepage hero CTA and product routes.
- 2026-05-28: Added pointer-drag rotation to the homepage travel globe with a circular hit area layered over the planet, keeping the oversized canvas non-blocking for surrounding page content.
- 2026-05-28: Homepage travel now sets San Francisco, USA as the current open-ended location from May 25 onward, removes the Madrid/Croatia future stops, and switches travel-date status checks to `America/Los_Angeles`.
- 2026-05-21: Moved the homepage OMI proof teaser into the first slot of the featured LUT stack so case-study proof leads the product cards.
- 2026-05-21: Clamped LUT listing-card descriptions to a three-line block so the longer HALOCLYNE copy does not make its card taller than the other LUT cards.
- 2026-05-21: Switched Sidestream fulfillment to the private Blob Mac install package DMG so the email sends one polished Finder-style package with the signed ZXP, ZXP Installer target, and fallback installer link; `/api/download` still streams large private Blob files instead of buffering them in memory.
- 2026-05-21: Added `/api/plugin-telemetry` plus the `sidestream_telemetry_events` Supabase table so the Sidestream CEP extension can upload redacted batched search, preview, download, import, settings, heartbeat, and error telemetry through the server-only Postgres helper.
- 2026-05-21: Added the first Supabase/Postgres business-ledger integration: schema migration, server-only pooled Postgres helper, Stripe Checkout/webhook persistence, lead capture storage, license rows, hashed download-link records, and download outcome logging.
- 2026-05-19: Added the Complete LUT Bundle to the LUT shop with a `$87` compare-at / `$39` launch bundle price, private Blob ZIP, live Stripe Price fallback, checkout catalog mapping, sitemap/LLM mirrors, and a bundle detail page that scrolls through all available individual LUTs.
- 2026-05-17: LUT cards, detail pages, homepage featured cards, sticky mobile CTAs, click analytics, and Checkout Session metadata now use the shared display-pricing helper with `$29` compare-at / `$18` launch pricing for LUTs.
- 2026-05-17: Removed the retired AI clip-search plugin from public plugin data, SEO mirrors, sitemap/LLM mirrors, checkout catalog, analytics persona copy, and README routing docs.
- 2026-05-16: Sidestream product cards and detail pages now use an optimized 11-second plugin demo video from `videos/plugin showcase/`, with a mobile MP4 variant and poster frame for faster product-page loading.
- 2026-05-16: Sidestream is temporarily free through a new $0 Stripe Price fallback, with the plugin listing/detail copy updated to show the free email-link flow.
- 2026-05-16: Sidestream 1.0.2 is released on the plugins page with a private Vercel Blob ZXP, a dedicated Stripe one-time price fallback, and email-delivered download fulfillment through the existing plugin checkout flow.
- 2026-05-15: ONYX copy has been restored to its nighttime look across shared product data, route fallbacks, homepage fallback cards, FAQ copy, and `llms.txt`.
- 2026-05-14: Homepage travel adds Madrid, Spain for Jun 7-Jul 6 and Croatia for Jul 6-Aug 6, including map/globe profiles that render on both desktop and mobile travel layouts.
- 2026-05-14: OMI proof copy now says `7 million` across the homepage proof teaser, portfolio tile, and service case-study fallback copy.
- 2026-05-13: LUT before/after previews now disable native video interaction and fall back to poster layers inside constrained TikTok/Instagram-style in-app browsers to prevent random fullscreen video flashes on product pages.
- 2026-05-12: Homepage travel globe now applies a +60 degree counterclockwise longitude framing offset so the current location sits farther right on the planet without changing itinerary data.
- 2026-05-12: Checkout Session creation now always enables Stripe-hosted manual promotion codes and no longer pre-applies `HIFRIEND`, because Stripe hides the promo-code field when a `discounts` array is supplied.
- 2026-05-11: Checkout success confirmation and webhook fulfillment now treat Stripe `no_payment_required` sessions as complete, so 100% promotion-code orders can receive normal download delivery while unpaid sessions are not fulfilled.
- 2026-05-11: LUT list page no longer renders the buyer-guide recommendation block, and the portfolio title/category header is excluded from scroll blur so the jump buttons stay crisp.
- 2026-05-11: Mobile homepage hero headline is 50% larger than the previous mobile lockup while the `BUY LUTS` CTA card is visually halved and kept at a mobile-safe tap height.
- 2026-05-11: Homepage travel now marks Sydney, Australia as current automatically from `site/travel.js` start dates instead of manually maintained status flags.
- 2026-05-10: Mobile homepage hero now mirrors the desktop `EVERY FRAME TELLS A STORY.` headline lockup while keeping a mobile-safe centered size and the scaled `BUY LUTS` CTA beneath it.
- 2026-05-09: Homepage hero centers `EVERY FRAME TELLS A STORY.` at half the previous headline size, places a 20%-smaller original product-card `BUY LUTS` CTA directly underneath, and removes the byline/tagline copy.
- 2026-05-07: Mobile homepage hero name now renders smaller on one line while keeping the desktop two-line name treatment.
- 2026-05-07: Mobile homepage hero copy and the primary LUT CTA now sit about 20vh higher over the hero media while leaving the desktop immersive hero layout unchanged.
- 2026-05-05: OMI case-study proof copy now spells out `6 million` instead of `6M` across homepage, portfolio, and service fallback copy.
- 2026-05-05: First-visit promo `Unlock` now reveals and copies `HIFRIEND` immediately after client-side email validation. Email capture, lead storage, promo email send, token creation, and analytics continue in the background. Checkout can auto-apply the LUT promo from the saved front-end claim so the button is not blocked by external API latency.
