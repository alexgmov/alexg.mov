# alexg.mov Website

This repository is the alexg.mov marketing site and digital product shop. It is a Vite/React single-page app with Vercel-style API handlers for analytics, Stripe Checkout, webhook fulfillment, and private download delivery.

## Runtime Architecture

- `site/main.jsx` boots the React app, first loading shared browser modules such as analytics, product data, SEO helpers, visuals, and chrome.
- `site/app.jsx` owns the query-string router. Public pages are represented by `?page=...`, for example `?page=luts`, `?page=lut:cinematic-01`, and `?page=success`.
- Route components are split into chunks: home, plugins, LUTs, and supporting pages.
- `site/home.jsx` owns the homepage hero, featured product rail, and OMI proof teaser. `site/pages.jsx` owns portfolio/services pages, keeps the service case-study fallback copy, and uses opt-in `data-portfolio-scroll-blur` markers only on portfolio content that should blur while the top category header stays crisp.
- `site/travel.js` owns the homepage travel itinerary. Each row has a `startsOn` ISO date; the browser derives `past`, `here`, and `next` statuses from the current date in the `Australia/Sydney` timezone.
- `site/product-data.js` mirrors public product data for the browser. It contains display copy, SEO data, product IDs used by checkout buttons, display pricing fields, media paths, and product page metadata. LUT copy also has fallback/indexable mirrors in `site/luts.jsx`, `site/home.jsx`, and `llms.txt`; keep those aligned when changing product descriptions.
- `site/pricing.jsx` owns display-only pricing helpers for rendered prices, compare-at launch pricing, and pricing-variant tracking attributes. Stripe Price IDs in `lib/products.js` remain the source of truth for what checkout actually charges.
- `site/visuals.jsx` owns reusable visual previews such as `LutPreview`. `site/media.js` owns responsive video helpers plus the constrained in-app browser detector; LUT previews render poster-based before/after layers in TikTok/Instagram-style WebViews so autoplay preview videos cannot jump into native fullscreen.
- `lib/products.js` is the server-side commerce catalog. This is the only product catalog used for Stripe Checkout and fulfillment.
- `api/*.js` files are Vercel-compatible CommonJS handlers. Locally, `server.js` maps those same files to `/api/...` routes and attaches small `res.status()`, `res.json()`, and `res.send()` helpers.
- `server.js` serves Vite middleware in development and the `dist/` build in production mode.
- `scripts/copy-static.mjs` copies static assets that Vite does not bundle directly, including `mockups`, `videos`, `robots.txt`, `sitemap.xml`, and `llms.txt`.

## Local Commands

```sh
npm run dev
npm run build
npm run preview
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
- `STRIPE_PRICE_SIDESTREAM`: optional Stripe Price ID override for the Sidestream plugin checkout product. Leave unset to use the checked-in temporary $0 Sidestream Price while the product is free.
- `MERIDIAN_BLOB_URL`: optional private Vercel Blob URL override for MERIDIAN.
- `ONYX_BLOB_URL`: optional private Vercel Blob URL override for ONYX.
- `HALOCLYNE_BLOB_URL`: optional private Vercel Blob URL override for HALOCLYNE.
- `SIDESTREAM_BLOB_URL`: optional private Vercel Blob URL override for Sidestream.
- `DOWNLOAD_SECRET`: HMAC secret used to sign expiring download links.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token used by `/api/download` to fetch private product files.
- `RESEND_API_KEY`: Resend key used by the webhook fulfillment email and first-visit promo code email.
- `FIRST_VISIT_OFFER_FROM`: optional sender override for the promo code email. Defaults to `alexg.mov <downloads@alexg.mov>`.
- `FIRST_VISIT_OFFER_REPLY_TO`: optional reply-to override for the promo code email. Defaults to `alex@alexg.mov`.
- `FIRST_VISIT_OFFER_UNSUBSCRIBE_EMAIL`: optional unsubscribe reply address override. Defaults to `FIRST_VISIT_OFFER_REPLY_TO`.
- `FIRST_VISIT_OFFER_EMAIL_ENABLED`: set to `0` to disable the promo code email while keeping the on-site code reveal active.
- `FIRST_VISIT_OFFER_SECRET`: optional HMAC secret for first-visit offer tokens. Falls back to `DOWNLOAD_SECRET`, then `STRIPE_SECRET_KEY`, then the dev fallback in `lib/first-visit-offer.js`.
- `EMAIL_POSTAL_ADDRESS` or `BUSINESS_POSTAL_ADDRESS`: footer address to include for commercial email compliance.
- `ANALYTICS_LOG_DIR`: optional local analytics log directory.
- `ANALYTICS_SALT`: optional visitor fingerprint salt. Falls back to `DOWNLOAD_SECRET`.

Never expose Stripe secret keys, webhook secrets, Resend keys, Blob tokens, or `DOWNLOAD_SECRET` in frontend files.

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
11. The browser redirects to the Stripe-hosted Checkout URL.

The integration intentionally uses Stripe-hosted Checkout Sessions for one-time digital purchases.

## Display Pricing

Public product entries can include optional display-only pricing fields:

- `price`: frontend display price. Stripe still charges the server-side Stripe Price ID.
- `compareAtPrice`: regular/launch anchor rendered as a crossed-out price only when it is higher than `price`.
- `priceLabel`: small supporting label such as `Launch price`.
- `priceNote`: product-detail reassurance copy beside the price.
- `pricingVariant`: optional stable analytics label. If omitted, `site/pricing.jsx` derives labels such as `launch-29-18`.

The current LUT pricing pattern is `$29` compare-at and `$18` launch price. Do not invent fake high anchors such as `$99` unless that was a real bona fide price or a defensible planned regular price. Sidestream remains visually free while its checked-in Stripe fallback is a temporary $0 Price; do not display `$18` for it until `STRIPE_PRICE_SIDESTREAM` points at a real paid Price.

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
- Frontend page `plugin:sidestream` -> checkout product `sidestream` -> temporary $0 Stripe Checkout -> Sidestream ZXP.

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
7. Fulfillment requires a configured product Blob URL, customer email, `DOWNLOAD_SECRET`, and `RESEND_API_KEY`.
8. `api/download.makeLink()` creates a signed URL valid for 48 hours.
9. Resend sends the buyer an email from `alexg.mov <downloads@alexg.mov>`.

Important operational detail: fulfillment errors are logged, but the webhook still responds with `{ received: true }`. That means Stripe will not retry a failed Resend send or missing-product configuration after the handler catches the error. Check deployment logs after product launches and webhook tests.

## Download Delivery

`api/download.js` serves private product files through signed links:

1. The link contains `p`, `exp`, and `sig` query parameters.
2. `sig` is an HMAC-SHA256 signature over `productId:exp` using `DOWNLOAD_SECRET`.
3. Expired links return `410`.
4. Invalid signatures return `403`.
5. Missing products return `404`.
6. The handler fetches the private Blob URL with `BLOB_READ_WRITE_TOKEN`.
7. The response streams the file as an attachment using `downloadFilename`.

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

The current location is derived automatically at page load using the current date in the `Australia/Sydney` timezone. The latest row whose `startsOn` date is today or earlier becomes `here`; earlier rows become `past`; later rows become `next`.

`HologramGlobe()` in `site/home.jsx` applies a visual +60 degree longitude rotation after centering the current location. Keep that offset separate from `LOCATIONS` latitude/longitude data so the list and date logic remain geographically correct while the planet framing can be art-directed.

## Recent Change Log

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
