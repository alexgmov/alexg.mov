const Stripe = require('stripe');
const { Resend } = require('resend');
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
    const session = event.data.object;
    const { productId } = session.metadata;
    const product = PRODUCTS[productId];
    const email = session.customer_details?.email;

    if (!product?.blobUrl || !email) {
      console.error('Missing product blobUrl or customer email', { productId, email });
      return res.json({ received: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'alexg.mov <downloads@alexg.mov>',
      to: email,
      subject: `Your ${product.name} download is ready`,
      html: buildEmail(product.name, product.blobUrl),
    });
  }

  res.json({ received: true });
};

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
