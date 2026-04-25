const crypto = require('crypto');
const { PRODUCTS } = require('./products');

function sign(productId, exp) {
  return crypto
    .createHmac('sha256', process.env.DOWNLOAD_SECRET)
    .update(`${productId}:${exp}`)
    .digest('hex');
}

function makeLink(origin, productId, hoursValid = 48) {
  const exp = Date.now() + hoursValid * 60 * 60 * 1000;
  const sig = sign(productId, exp);
  return `${origin}/api/download?p=${productId}&exp=${exp}&sig=${sig}`;
}

module.exports = async function handler(req, res) {
  const { p: productId, exp, sig } = Object.fromEntries(
    new URL(req.url, 'http://x').searchParams
  );

  if (!productId || !exp || !sig) return res.status(400).end();

  if (Date.now() > parseInt(exp)) {
    return res.status(410).send('This download link has expired.');
  }

  const expected = sign(productId, exp);
  if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
    return res.status(403).end();
  }

  const product = PRODUCTS[productId];
  if (!product?.blobUrl) return res.status(404).end();

  const upstream = await fetch(product.blobUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!upstream.ok) return res.status(502).send('File unavailable.');

  const filename = product.blobUrl.split('/').pop();
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(filename)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { Readable } = require('stream');
  Readable.fromWeb(upstream.body).pipe(res);
};

module.exports.makeLink = makeLink;
