# alexg.mov Website

This repository is the alexg.mov marketing site and digital product shop. It is a Vite/React single-page app with Vercel-style API handlers for analytics, Stripe Checkout, webhook fulfillment, and private download delivery.

## Runtime Architecture

- `site/main.jsx` boots the React app, first loading shared browser modules such as analytics, product data, SEO helpers, visuals, and chrome.
- `site/app.jsx` owns the query-string router. Public pages are represented by `?page=...`, for example `?page=luts`, `?page=lut:cinematic-01`, and `?page=success`.
- Route components are split into chunks: home, plugins, LUTs, and supporting pages.
- `site/product-data.js` mirrors public product data for the browser. It contains display copy, SEO data, product IDs used by checkout buttons, media paths, and product page metadata.
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

## Environment Variables

Commerce and fulfillment use these variables:

- `SITE_URL`: canonical public origin. Defaults to `https://alexg.mov`.
- `STRIPE_SECRET_KEY`: server-side Stripe key used to create and inspect Checkout Sessions.
- `STRIPE_WEBHOOK_SECRET`: webhook signing secret for `/api/webhook`.
- `STRIPE_PRICE_SOLENE`: Stripe Price ID for the Meridian/Solene checkout product.
- `STRIPE_PRICE_ONYX`: Stripe Price ID for the Onyx checkout product.
- `ONYX_BLOB_URL`: private Vercel Blob URL for the Onyx zip.
- `DOWNLOAD_SECRET`: HMAC secret used to sign expiring download links.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token used by `/api/download` to fetch private product files.
- `RESEND_API_KEY`: Resend key used by the webhook fulfillment email.
- `ANALYTICS_LOG_DIR`: optional local analytics log directory.
- `ANALYTICS_SALT`: optional visitor fingerprint salt. Falls back to `DOWNLOAD_SECRET`.

Never expose Stripe secret keys, webhook secrets, Resend keys, Blob tokens, or `DOWNLOAD_SECRET` in frontend files.

## Stripe Checkout Flow

1. A product detail page calls `POST /api/create-checkout` with a `productId`.
2. `api/create-checkout.js` validates the product against `lib/products.js`.
3. Checkout fails closed if the product is unknown, the Stripe secret is missing, the product has no `stripePriceId`, or the product has no `blobUrl`.
4. The handler creates a Stripe Checkout Session in `payment` mode with one Price ID from the server catalog.
5. The Checkout Session metadata stores `{ productId }`. The webhook depends on this metadata for fulfillment.
6. `success_url` returns the buyer to `/?page=success&session_id={CHECKOUT_SESSION_ID}`.
7. `cancel_url` returns the buyer to the product page declared in `product.page`.
8. `statement_descriptor_suffix` is set when the product defines `statementDescriptorSuffix`.
9. The server logs a `checkout_session_created` analytics event.
10. The browser redirects to the Stripe-hosted Checkout URL.

The integration intentionally uses Stripe-hosted Checkout Sessions for one-time digital purchases.

## Checkout Success Page

The success page does not fulfill the order. It only confirms the paid session for the browser:

1. `site/pages.jsx` reads `session_id` from the URL.
2. It calls `GET /api/checkout-session?session_id=...`.
3. `api/checkout-session.js` retrieves the Checkout Session from Stripe.
4. If `payment_status` is not `paid`, it returns `402`.
5. If paid, it returns the customer email and product name for confirmation copy.

Download email delivery is handled by the Stripe webhook, not by this page.

## Product Fulfillment Protocol

Fulfillment is driven by the server catalog in `lib/products.js`.

Each sellable product entry must include:

- `name`: display name used in the fulfillment email.
- `stripePriceId`: Stripe Price ID, usually from an environment variable.
- `statementDescriptorSuffix`: optional card statement suffix.
- `blobUrl`: private Vercel Blob URL for the purchased zip.
- `downloadFilename`: filename sent in the `Content-Disposition` download header.
- `page`: SPA route used when checkout is canceled.

The browser-side product entry must also point to the same server product key:

```js
checkoutProductId: 'onyx'
```

That value must match a key in `PRODUCTS`. The current LUT pattern is:

- Frontend page `lut:cinematic-01` -> checkout product `solene` -> Meridian zip.
- Frontend page `lut:onyx` -> checkout product `onyx` -> Onyx zip.

When adding a new product:

1. Upload the zip to Vercel Blob as a private object.
2. Add a server product in `lib/products.js`.
3. Add the Stripe Price ID and Blob URL environment variables.
4. Add or update the public product data in `site/product-data.js` and the matching route data in the route file if needed.
5. Make sure the frontend `checkoutProductId` matches the server catalog key.
6. Run a test Checkout Session and confirm that the webhook sends the email.
7. Open the emailed link before and after expiration to confirm download and expiry behavior.

## Webhook Fulfillment Flow

`api/webhook.js` is the only automatic fulfillment path.

1. Stripe sends `checkout.session.completed` to `/api/webhook`.
2. The handler reads the raw request body and verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.
3. The webhook logs `stripe_webhook_checkout_completed`.
4. `fulfillCheckoutSession()` reads `metadata.productId` from the Stripe session.
5. The product is loaded from `lib/products.js`.
6. Fulfillment requires a configured product Blob URL, customer email, `DOWNLOAD_SECRET`, and `RESEND_API_KEY`.
7. `api/download.makeLink()` creates a signed URL valid for 48 hours.
8. Resend sends the buyer an email from `alexg.mov <downloads@alexg.mov>`.

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
