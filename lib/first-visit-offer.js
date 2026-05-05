const crypto = require('crypto');

const OFFER_CODE = 'HIFRIEND';
const OFFER_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const OFFER_PRODUCT_IDS = new Set(['solene', 'onyx', 'haloclyne']);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function offerSecret() {
  return process.env.FIRST_VISIT_OFFER_SECRET ||
    process.env.DOWNLOAD_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    'alexg-mov-dev-offer-secret';
}

function hmac(value) {
  return crypto
    .createHmac('sha256', offerSecret())
    .update(String(value))
    .digest('base64url');
}

function hashEmail(email) {
  return crypto
    .createHmac('sha256', offerSecret())
    .update(normalizeEmail(email))
    .digest('hex')
    .slice(0, 32);
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createOfferToken(email, options = {}) {
  const now = Number(options.now || Date.now());
  const payload = {
    v: 1,
    code: OFFER_CODE,
    emailHash: hashEmail(email),
    iat: now,
    exp: now + Number(options.ttlMs || OFFER_TTL_MS),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${hmac(encoded)}`;
}

function verifyOfferToken(token, options = {}) {
  const value = String(token || '');
  const parts = value.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const [encoded, signature] = parts;
  if (!safeEqual(signature, hmac(encoded))) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  const now = Number(options.now || Date.now());
  if (payload?.v !== 1) return null;
  if (payload.code !== OFFER_CODE) return null;
  if (!payload.emailHash || Number(payload.exp || 0) < now) return null;
  return payload;
}

function isOfferEligibleProduct(productId, product) {
  return OFFER_PRODUCT_IDS.has(String(productId || '')) && String(product?.page || '').startsWith('lut:');
}

function configuredPromotionCodeId() {
  return process.env.STRIPE_PROMO_HIFRIEND_ID ||
    process.env.STRIPE_PROMOTION_CODE_HIFRIEND ||
    process.env.HIFRIEND_PROMOTION_CODE_ID ||
    '';
}

module.exports = {
  OFFER_CODE,
  createOfferToken,
  configuredPromotionCodeId,
  hashEmail,
  isOfferEligibleProduct,
  isValidEmail,
  normalizeEmail,
  verifyOfferToken,
};
