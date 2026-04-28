const Stripe = require('stripe');
const { PRODUCTS } = require('../lib/products');
const { ensureVisitorIds, logEvent } = require('../lib/analytics-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const analyticsIds = ensureVisitorIds(req, res);

  const { session_id: sessionId } = Object.fromEntries(
    new URL(req.url, 'http://x').searchParams
  );

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing checkout session' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Checkout is not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('Stripe session lookup failed:', err.message);
    return res.status(404).json({ error: 'Checkout session not found' });
  }

  const product = PRODUCTS[session.metadata?.productId];
  await logEvent({
    type: 'checkout_session_checked',
    source: 'server',
    stripeSessionId: session.id,
    stripeSessionStatus: session.status,
    paymentStatus: session.payment_status,
    productId: session.metadata?.productId,
    productName: product?.name,
    amountTotal: session.amount_total,
    currency: session.currency,
    visitorId: analyticsIds.visitorId,
    sessionId: analyticsIds.sessionId,
    visitorHash: analyticsIds.visitorHash,
  });

  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Checkout session is not paid' });
  }

  res.json({
    email: session.customer_details?.email || session.customer_email || '',
    productName: product?.name || 'your files',
  });
};
