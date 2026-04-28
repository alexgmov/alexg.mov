const Stripe = require('stripe');
const { PRODUCTS } = require('../lib/products');
const { ensureVisitorIds, logEvent } = require('../lib/analytics-store');

const CANONICAL_ORIGIN = normalizeOrigin(process.env.SITE_URL || 'https://alexg.mov');

function readBody(req) {
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

function getCheckoutOrigin(req, host) {
  if (!isLocalHost(host)) return CANONICAL_ORIGIN;
  return `${getRequestProto(req, host)}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const analyticsIds = ensureVisitorIds(req, res);

  let body;
  try {
    const buf = await readBody(req);
    body = JSON.parse(buf.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { productId } = body || {};
  const product = PRODUCTS[productId];
  if (!product) return res.status(400).json({ error: 'Unknown product' });
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Checkout is not configured' });
  }
  if (!product.stripePriceId) {
    console.error('Stripe price is not configured', { productId });
    return res.status(500).json({ error: 'Checkout product is not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const host = firstHeaderValue(req.headers['x-forwarded-host'] || req.headers.host);
  const origin = getCheckoutOrigin(req, host);
  const returnPage = encodeURIComponent(product.page || `plugin:${productId}`);

  let session;
  try {
    const checkoutParams = {
      mode: 'payment',
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${origin}/?page=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?page=${returnPage}`,
      metadata: { productId },
    };

    if (product.statementDescriptorSuffix) {
      checkoutParams.payment_intent_data = {
        statement_descriptor_suffix: product.statementDescriptorSuffix,
      };
    }

    session = await stripe.checkout.sessions.create(checkoutParams);
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(502).json({ error: 'Payment provider error. Please try again.' });
  }

  await logEvent({
    type: 'checkout_session_created',
    source: 'server',
    productId,
    productName: product.name,
    productPage: product.page,
    stripeSessionId: session.id,
    stripeSessionStatus: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    visitorId: analyticsIds.visitorId,
    sessionId: analyticsIds.sessionId,
    visitorHash: analyticsIds.visitorHash,
  });

  res.json({ url: session.url });
};
