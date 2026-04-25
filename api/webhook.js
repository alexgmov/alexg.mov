const Stripe = require('stripe');
const { Resend } = require('resend');
const { PRODUCTS } = require('./products');
const { makeLink } = require('./download');

const CANONICAL_ORIGIN = normalizeOrigin(process.env.SITE_URL || 'https://alexg.mov');

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

module.exports = async function handler(req, res) {
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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature failed:', err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      try {
        await fulfillCheckoutSession(event.data.object, req);
      } catch (err) {
        console.error('Checkout fulfillment failed:', {
          eventId: event.id,
          sessionId: event.data.object?.id,
          message: err.message,
        });
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler crashed:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

async function fulfillCheckoutSession(session, req) {
  const { productId } = session.metadata || {};
  const product = PRODUCTS[productId];
  const email = session.customer_details?.email || session.customer_email;

  if (!product?.blobUrl) {
    throw new Error(`Missing product for productId "${productId || 'unknown'}"`);
  }
  if (!email) {
    throw new Error(`Missing customer email for session "${session.id}"`);
  }
  if (!process.env.DOWNLOAD_SECRET) {
    throw new Error('DOWNLOAD_SECRET is not configured');
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const downloadUrl = makeLink(getPublicOrigin(req), productId);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: 'alexg.mov <downloads@alexg.mov>',
    to: email,
    subject: `Your ${product.name} download is ready`,
    html: buildEmail(product.name, downloadUrl),
  });

  if (result?.error) {
    throw new Error(result.error.message || 'Resend rejected the email');
  }
}

function buildEmail(productName, downloadUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;max-width:560px;margin:0 auto;padding:48px 24px">
  <p style="font-family:monospace;font-size:11px;color:#888;letter-spacing:.06em;margin:0 0 40px">ALEXG.MOV · DOWNLOAD READY</p>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:-.02em;margin:0 0 16px">${productName}</h1>
  <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 36px">Your purchase is confirmed. Click below to download your files.<br>This link expires in 48 hours — save the files somewhere safe.</p>
  <a href="${downloadUrl}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;font-family:monospace;font-size:13px;letter-spacing:.04em;text-decoration:none;border-radius:2px">↓ Download ${productName}</a>
  <hr style="border:none;border-top:1px solid #eee;margin:48px 0 24px">
  <p style="font-size:13px;color:#888;line-height:1.6;margin:0">Hit an install bug? Email <a href="mailto:alex@alexg.mov" style="color:#111;text-decoration:none;font-family:monospace">alex@alexg.mov</a> — reply within 24 hours.</p>
</body>
</html>`;
}
