const Stripe = require('stripe');
const { PRODUCTS } = require('./products');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const { session_id: sessionId } = Object.fromEntries(
    new URL(req.url, 'http://x').searchParams
  );

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing checkout session' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('Stripe session lookup failed:', err.message);
    return res.status(404).json({ error: 'Checkout session not found' });
  }

  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Checkout session is not paid' });
  }

  const product = PRODUCTS[session.metadata?.productId];

  res.json({
    email: session.customer_details?.email || session.customer_email || '',
    productName: product?.name || 'your files',
  });
};
