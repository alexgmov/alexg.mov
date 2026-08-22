const crypto = require('crypto');

const TOKEN_NAME = 'SIDESTREAM_HETZNER_EXPORT_TOKEN';
const PUBLIC_KEY_NAME = 'SIDESTREAM_HETZNER_EXPORT_PUBLIC_KEY';
const NOT_AFTER_NAME = 'SIDESTREAM_HETZNER_EXPORT_NOT_AFTER';
const EXCLUDED = new Set([
  TOKEN_NAME,
  PUBLIC_KEY_NAME,
  NOT_AFTER_NAME,
  'ALEXG_HETZNER_ORIGIN_URL',
  'SIDESTREAM_ORIGIN_AUTH_SECRET',
]);

function createSecretExportHandler(environment = process.env, now = () => new Date()) {
  return function secretExportHandler(req, res) {
    setHeaders(res);
    if (typeof req.headers?.origin === 'string' || Array.isArray(req.headers?.origin)) {
      return res.status(403).json({ error: 'Browser access is forbidden' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = validSecret(environment[TOKEN_NAME]);
    const notAfter = new Date(environment[NOT_AFTER_NAME] || 'invalid');
    if (!token || !Number.isFinite(notAfter.getTime()) || now().getTime() > notAfter.getTime()) {
      return res.status(503).json({ error: 'Secret export is unavailable' });
    }
    if (!singleValidBearer(req, token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const values = Object.fromEntries(
        Object.entries(environment)
          .filter(([name, value]) => shouldExport(name, value))
          .sort(([left], [right]) => left.localeCompare(right))
      );
      const envelope = encrypt({
        version: 1,
        createdAt: now().toISOString(),
        values,
      }, String(environment[PUBLIC_KEY_NAME] || ''));
      return res.status(200).json(envelope);
    } catch {
      return res.status(503).json({ error: 'Secret export failed' });
    }
  };
}

function encrypt(payload, publicKeyBase64) {
  const encoded = publicKeyBase64.trim();
  if (!/^[A-Za-z0-9+/=]{256,2048}$/.test(encoded)) throw new Error('Invalid public key');
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(encoded, 'base64'),
    format: 'der',
    type: 'spki',
  });
  if (publicKey.asymmetricKeyType !== 'rsa') throw new Error('Public key must be RSA');

  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  const encryptedKey = crypto.publicEncrypt({
    key: publicKey,
    oaepHash: 'sha256',
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  }, key);
  key.fill(0);
  return {
    version: 1,
    algorithm: 'RSA-OAEP-SHA256+A256GCM',
    encryptedKey: encryptedKey.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

function shouldExport(name, value) {
  if (!value || EXCLUDED.has(name)) return false;
  return name.startsWith('SIDESTREAM_') ||
    name.startsWith('STRIPE_') ||
    name.startsWith('RESEND_') ||
    name.startsWith('BLOB_') ||
    name.startsWith('POSTGRES_') ||
    name.endsWith('_BLOB_URL') ||
    ['DATABASE_URL', 'NEON_DATABASE_URL', 'DOWNLOAD_SECRET', 'SITE_URL'].includes(name);
}

function validSecret(value) {
  const secret = String(value || '');
  return secret.length >= 32 && secret.length <= 512 && /^[\x21-\x7e]+$/.test(secret)
    ? secret
    : '';
}

function singleValidBearer(req, token) {
  const authorization = req.headers?.authorization;
  if (!authorization || Array.isArray(authorization)) return false;
  if (Array.isArray(req.rawHeaders) && req.rawHeaders.length > 0) {
    let count = 0;
    for (let index = 0; index < req.rawHeaders.length; index += 2) {
      if (String(req.rawHeaders[index]).toLowerCase() === 'authorization') count += 1;
    }
    if (count !== 1) return false;
  }
  const actual = crypto.createHash('sha256').update(authorization).digest();
  const expected = crypto.createHash('sha256').update(`Bearer ${token}`).digest();
  return crypto.timingSafeEqual(actual, expected);
}

function setHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Authorization, Origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

module.exports = { createSecretExportHandler };
