const crypto = require('crypto');

function isHetznerRuntime(environment = process.env) {
  return environment.SIDESTREAM_HETZNER_RUNTIME === '1';
}

function configuredHost(environment = process.env) {
  if (!isHetznerRuntime(environment)) return environment.HOST || '0.0.0.0';
  const host = environment.HOST || '127.0.0.1';
  if (host !== '127.0.0.1' && host !== '::1') {
    throw new Error('The Hetzner runtime may listen only on loopback');
  }
  return host;
}

function configuredOriginSecret(environment = process.env) {
  if (!isHetznerRuntime(environment)) return '';
  const secret = String(environment.SIDESTREAM_ORIGIN_AUTH_SECRET || '');
  if (secret.length < 32 || secret.length > 512 || !/^[\x21-\x7e]+$/.test(secret)) {
    throw new Error('SIDESTREAM_ORIGIN_AUTH_SECRET must be 32-512 printable non-space characters');
  }
  return secret;
}

function authorizedOriginRequest(req, secret) {
  if (!secret) return false;
  const value = req?.headers?.['x-sidestream-origin-auth'];
  const supplied = Array.isArray(value) ? value[0] || '' : String(value || '').split(',')[0].trim();
  if (supplied.length !== secret.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(secret));
}

module.exports = {
  authorizedOriginRequest,
  configuredHost,
  configuredOriginSecret,
  isHetznerRuntime,
};
