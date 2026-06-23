const crypto = require('crypto');
const { Readable } = require('stream');
const { PRODUCTS } = require('../lib/products');
const {
  recordDownloadEvent,
  tryRecord,
} = require('../lib/supabase-db');

const SIDESTREAM_PUBLIC_DOWNLOAD_URL = process.env.SIDESTREAM_PUBLIC_DOWNLOAD_URL || 'https://sidestream-xi.vercel.app/api/download';

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

function contentDisposition(filename) {
  const fallback = filename
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '')
    .trim() || 'download.zip';
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).end();
    }

    const { p: productId, exp, sig } = Object.fromEntries(
      new URL(req.url, 'http://x').searchParams
    );

    if (productId === 'sidestream') {
      return redirectSidestreamDownload(req, res, { exp, status: 'sidestream_public_redirect' });
    }

    if (!productId || !exp || !sig) {
      await logDownload(req, { productId, exp, status: 'missing_params', httpStatus: 400 });
      return res.status(400).end();
    }

    if (!process.env.DOWNLOAD_SECRET) {
      console.error('DOWNLOAD_SECRET is not configured');
      await logDownload(req, { productId, exp, status: 'missing_download_secret', httpStatus: 500 });
      return res.status(500).send('Download is not configured.');
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not configured');
      await logDownload(req, { productId, exp, status: 'missing_blob_token', httpStatus: 500 });
      return res.status(500).send('Download storage is not configured.');
    }

    if (Date.now() > parseInt(exp, 10)) {
      await logDownload(req, { productId, exp, status: 'expired', httpStatus: 410 });
      return res.status(410).send('This download link has expired.');
    }

    const expected = sign(productId, exp);
    let valid = false;
    try {
      valid = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch {}
    if (!valid) {
      await logDownload(req, { productId, exp, status: 'invalid_signature', httpStatus: 403 });
      return res.status(403).end();
    }

    const product = PRODUCTS[productId];
    if (!product?.blobUrl) {
      await logDownload(req, { productId, exp, status: 'missing_product', httpStatus: 404 });
      return res.status(404).end();
    }

    const isHeadRequest = req.method === 'HEAD';
    const upstream = await fetch(product.blobUrl, {
      method: isHeadRequest ? 'HEAD' : 'GET',
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });

    if (!upstream.ok) {
      console.error('Blob download failed:', { status: upstream.status, productId });
      await logDownload(req, {
        productId,
        exp,
        status: 'blob_failed',
        httpStatus: 502,
        metadata: { upstreamStatus: upstream.status },
      });
      return res.status(502).send('File unavailable.');
    }

    const filename = product.downloadFilename || decodeURIComponent(product.blobUrl.split('/').pop() || 'download.zip');
    const contentLength = upstream.headers.get('content-length');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', contentDisposition(filename));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    await logDownload(req, {
      productId,
      exp,
      status: isHeadRequest ? 'head_served' : 'served',
      httpStatus: 200,
      metadata: { bytes: contentLength ? Number(contentLength) : null, filename },
    });

    if (isHeadRequest) {
      return res.end();
    }

    if (!upstream.body || typeof res.write !== 'function') {
      const file = Buffer.from(await upstream.arrayBuffer());
      return res.end(file);
    }

    await new Promise((resolve, reject) => {
      const stream = Readable.fromWeb(upstream.body);
      stream.on('error', reject);
      res.on('finish', resolve);
      res.on('close', resolve);
      stream.pipe(res);
    });
  } catch (err) {
    console.error('Download failed:', err);
    return res.status(500).send('Download failed.');
  }
};

module.exports.makeLink = makeLink;

async function redirectSidestreamDownload(req, res, { exp, status }) {
  await logDownload(req, {
    productId: 'sidestream',
    exp,
    status,
    httpStatus: 302,
    metadata: { destination: SIDESTREAM_PUBLIC_DOWNLOAD_URL },
  });
  res.statusCode = 302;
  res.setHeader('Location', SIDESTREAM_PUBLIC_DOWNLOAD_URL);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

async function logDownload(req, details) {
  await tryRecord('download event', () => recordDownloadEvent({
    req,
    ...details,
  }));
}
