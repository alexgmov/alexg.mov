const Stripe = require('stripe');
const { PRODUCTS } = require('./products');

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    success_url: `${origin}/?page=plugin%3A${productId}&purchased=true`,
    cancel_url: `${origin}/?page=plugin%3A${productId}`,
    metadata: { productId },
  });

  res.json({ url: session.url });
};
