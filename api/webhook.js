const Stripe = require('stripe');
const { Resend } = require('resend');
const { PRODUCTS } = require('../lib/products');
const { makeLink } = require('./download');
const { logEvent } = require('../lib/analytics-store');
const {
  recordCheckoutSession,
  recordFulfilledPurchase,
  recordStripeEvent,
  isCheckoutSessionFulfilled,
} = require('../lib/postgres-db');

const CANONICAL_ORIGIN = normalizeOrigin(process.env.SITE_URL || 'https://alexg.mov');
const SIDESTREAM_PUBLIC_DOWNLOAD_URL = process.env.SIDESTREAM_PUBLIC_DOWNLOAD_URL || 'https://sidestream-xi.vercel.app/api/download';

function readBody(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === 'string') return Promise.resolve(Buffer.from(req.body));
  if (req.rawBody) return Promise.resolve(Buffer.from(req.rawBody));
  if (typeof req.on !== 'function') return Promise.resolve(Buffer.from(JSON.stringify(req.body || {})));

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function normalizeOrigin(origin) {
  return String(origin || '').replace(/\/+$/, '');
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return String(value || '').split(',')[0].trim();
}

function isLocalHost(host) {
  const value = firstHeaderValue(host).toLowerCase();
  const hostname = value.startsWith('[')
    ? value.slice(1, value.indexOf(']'))
    : value.split(':')[0];

  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function getRequestProto(req, host) {
  const forwardedProto = firstHeaderValue(req.headers['x-forwarded-proto']);
  if (forwardedProto) return forwardedProto;
  return isLocalHost(host) ? 'http' : 'https';
}

function getPublicOrigin(req) {
  const host = firstHeaderValue(req.headers['x-forwarded-host'] || req.headers.host);
  if (!isLocalHost(host)) return CANONICAL_ORIGIN;
  return `${getRequestProto(req, host)}://${host}`;
}

function isFulfilledCheckoutStatus(paymentStatus) {
  return paymentStatus === 'paid' || paymentStatus === 'no_payment_required';
}

const defaultDependencies = Object.freeze({
  Stripe,
  Resend,
  PRODUCTS,
  makeLink,
  logEvent,
  recordCheckoutSession,
  recordFulfilledPurchase,
  recordStripeEvent,
  isCheckoutSessionFulfilled,
});

function createWebhookHandler(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end();
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook environment is not configured');
      return res.status(500).json({ error: 'Webhook environment is not configured' });
    }

    const rawBody = await readBody(req);
    const sig = req.headers['stripe-signature'];
    const stripe = new dependencies.Stripe(process.env.STRIPE_SECRET_KEY);

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature failed:', err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object || {};
      const productId = session.metadata?.productId;
      const product = dependencies.PRODUCTS[productId];

      await dependencies.logEvent({
        type: 'stripe_webhook_checkout_completed',
        source: 'stripe_webhook',
        stripeEventId: event.id,
        stripeSessionId: session.id,
        productId,
        stripeSessionStatus: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
      requireRecorded('checkout session completed', await dependencies.recordCheckoutSession(session, {
        productId,
        product,
      }));
      requireRecorded(
        'stripe webhook event received',
        await dependencies.recordStripeEvent(event, session),
      );

      if (!isFulfilledCheckoutStatus(session.payment_status)) {
        console.warn('Checkout session is not ready for fulfillment:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        });
        requireRecorded(
          'stripe webhook event processed',
          await dependencies.recordStripeEvent(event, session, 'processed'),
        );
        return res.json({ received: true });
      }

      const fulfillmentState = await dependencies.isCheckoutSessionFulfilled(session.id);
      if (fulfillmentState?.skipped) {
        throw new Error('Fulfillment database is not configured');
      }
      if (fulfillmentState?.fulfilled) {
        requireRecorded(
          'stripe webhook event processed',
          await dependencies.recordStripeEvent(event, session, 'processed'),
        );
        return res.json({ received: true, duplicate: true });
      }

      try {
        await fulfillCheckoutSession(session, req, dependencies);
        requireRecorded(
          'stripe webhook event processed',
          await dependencies.recordStripeEvent(event, session, 'processed'),
        );
      } catch (err) {
        console.error('Checkout fulfillment failed:', {
          eventId: event.id,
          sessionId: session.id,
          message: err.message,
        });
        try {
          requireRecorded(
            'stripe webhook event failed',
            await dependencies.recordStripeEvent(event, session, 'failed', err.message),
          );
        } catch (recordError) {
          console.error('Stripe webhook failure state was not persisted:', recordError.message);
        }
        return res.status(503).json({
          error: 'Checkout fulfillment is temporarily unavailable',
          retryable: true,
        });
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler crashed:', err);
    return res.status(503).json({ error: 'Webhook handler failed', retryable: true });
  }
  };
}

module.exports = createWebhookHandler();
module.exports.createWebhookHandler = createWebhookHandler;

async function fulfillCheckoutSession(session, req, dependencies = defaultDependencies) {
  const { productId } = session.metadata || {};
  const product = dependencies.PRODUCTS[productId];
  const email = session.customer_details?.email || session.customer_email;

  if (!product?.blobUrl) {
    throw new Error(`Missing product for productId "${productId || 'unknown'}"`);
  }
  if (!email) {
    throw new Error(`Missing customer email for session "${session.id}"`);
  }
  if (productId !== 'sidestream' && !process.env.DOWNLOAD_SECRET) {
    throw new Error('DOWNLOAD_SECRET is not configured');
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const origin = getPublicOrigin(req);
  const downloadUrl = productId === 'sidestream'
    ? SIDESTREAM_PUBLIC_DOWNLOAD_URL
    : dependencies.makeLink(origin, productId);
  const installUrl = productId === 'sidestream'
    ? `${origin}/?page=sidestream-install&download=${encodeURIComponent(downloadUrl)}`
    : '';
  const resend = new dependencies.Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: 'alexg.mov <downloads@alexg.mov>',
    to: email,
    subject: `Your ${product.name} download is ready`,
    html: buildEmail(product.name, downloadUrl, {
      downloadFilename: product.downloadFilename,
      installUrl,
      productId,
    }),
  }, {
    idempotencyKey: `stripe-checkout-fulfillment-${session.id}`.slice(0, 256),
  });

  if (result?.error) {
    throw new Error(result.error.message || 'Resend rejected the email');
  }

  requireRecorded('purchase fulfillment', await dependencies.recordFulfilledPurchase(session, {
    productId,
    product,
    email,
    downloadUrl,
    emailDeliveryId: result?.data?.id || '',
  }));
}

function requireRecorded(label, result) {
  if (result?.recorded) return result;
  const error = new Error(`${label} was not durably stored`);
  error.code = result?.skipped ? 'database_not_configured' : 'database_write_failed';
  throw error;
}

function buildEmail(productName, downloadUrl, options = {}) {
  const isSidestream = options.productId === 'sidestream';
  if (isSidestream) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;max-width:560px;margin:0 auto;padding:48px 24px">
  <p style="font-family:monospace;font-size:11px;color:#888;letter-spacing:.06em;margin:0 0 40px">ALEXG.MOV · DOWNLOAD READY</p>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:-.02em;margin:0 0 16px">${escapeHtml(productName)}</h1>
  <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 28px">Your purchase is confirmed. Download the Mac installer DMG, open it, then double-click Install Sidestream.pkg and follow the macOS installer prompts.<br>This download link expires in 48 hours.</p>
  <div style="display:flex;flex-wrap:wrap;gap:12px;margin:0 0 36px">
    <a href="${escapeAttribute(downloadUrl)}" style="display:inline-block;background:#111;color:#fff;padding:14px 22px;font-family:monospace;font-size:13px;letter-spacing:.04em;text-decoration:none;border-radius:2px">Download Mac Install Package</a>
    <a href="${escapeAttribute(options.installUrl || '')}" style="display:inline-block;background:#fff;color:#111;padding:14px 22px;font-family:monospace;font-size:13px;letter-spacing:.04em;text-decoration:none;border-radius:2px;border:1px solid #ddd">Open Backup Steps</a>
  </div>
  <p style="font-size:13px;color:#777;line-height:1.6;margin:0">No separate PDF, zip, or external installer app needed. The DMG contains the signed and notarized Sidestream installer package.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:48px 0 24px">
  <p style="font-size:13px;color:#888;line-height:1.6;margin:0">Hit an install bug? Email <a href="mailto:alex@alexg.mov" style="color:#111;text-decoration:none;font-family:monospace">alex@alexg.mov</a> — reply within 24 hours.</p>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;max-width:560px;margin:0 auto;padding:48px 24px">
  <p style="font-family:monospace;font-size:11px;color:#888;letter-spacing:.06em;margin:0 0 40px">ALEXG.MOV · DOWNLOAD READY</p>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:-.02em;margin:0 0 16px">${escapeHtml(productName)}</h1>
  <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 36px">Your purchase is confirmed. Download ${escapeHtml(options.downloadFilename || 'your files')} and save it somewhere safe.<br>This link expires in 48 hours.</p>
  <a href="${escapeAttribute(downloadUrl)}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;font-family:monospace;font-size:13px;letter-spacing:.04em;text-decoration:none;border-radius:2px">Download Files</a>
  <hr style="border:none;border-top:1px solid #eee;margin:48px 0 24px">
  <p style="font-size:13px;color:#888;line-height:1.6;margin:0">Hit an install bug? Email <a href="mailto:alex@alexg.mov" style="color:#111;text-decoration:none;font-family:monospace">alex@alexg.mov</a> — reply within 24 hours.</p>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
