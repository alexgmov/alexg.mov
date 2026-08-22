import assert from 'node:assert/strict';
import {
  constants,
  createDecipheriv,
  generateKeyPairSync,
  privateDecrypt,
} from 'node:crypto';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createSecretExportHandler } = require('../lib/hetzner-secret-export');
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const token = '0123456789abcdef0123456789abcdef';
const environment = Object.freeze({
  SIDESTREAM_HETZNER_EXPORT_TOKEN: token,
  SIDESTREAM_HETZNER_EXPORT_PUBLIC_KEY: publicKey.toString('base64'),
  SIDESTREAM_HETZNER_EXPORT_NOT_AFTER: '2026-08-22T06:00:00.000Z',
  SIDESTREAM_NEON_DATABASE_URL: 'postgres://user:password@example.invalid/neondb',
  STRIPE_SECRET_KEY: 'stripe-secret',
  RESEND_API_KEY: 'resend-secret',
  DOWNLOAD_SECRET: 'download-secret',
  VERCEL_URL: 'must-not-export',
});

test('the alexg secret export is encrypted, bearer-only, non-browser, and expiring', () => {
  const handler = createSecretExportHandler(
    environment,
    () => new Date('2026-08-22T05:00:00.000Z'),
  );
  assert.equal(invoke(handler, { method: 'GET', authorization: `Bearer ${token}` }).statusCode, 405);
  assert.equal(invoke(handler, { method: 'POST', authorization: 'Bearer wrong' }).statusCode, 401);
  assert.equal(invoke(handler, {
    method: 'POST',
    authorization: `Bearer ${token}`,
    origin: 'https://alexg.mov',
  }).statusCode, 403);

  const response = invoke(handler, { method: 'POST', authorization: `Bearer ${token}` });
  assert.equal(response.statusCode, 200);
  const key = privateDecrypt({
    key: privateKey,
    oaepHash: 'sha256',
    padding: constants.RSA_PKCS1_OAEP_PADDING,
  }, Buffer.from(response.payload.encryptedKey, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(response.payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(response.payload.tag, 'base64'));
  const payload = JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(response.payload.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8'));
  assert.equal(payload.values.STRIPE_SECRET_KEY, 'stripe-secret');
  assert.equal(payload.values.DOWNLOAD_SECRET, 'download-secret');
  assert.equal(payload.values.SIDESTREAM_HETZNER_EXPORT_TOKEN, undefined);
  assert.equal(payload.values.VERCEL_URL, undefined);

  const expired = createSecretExportHandler(
    environment,
    () => new Date('2026-08-22T06:00:01.000Z'),
  );
  assert.equal(invoke(expired, { method: 'POST', authorization: `Bearer ${token}` }).statusCode, 503);
});

function invoke(handler, options) {
  const headers = {};
  const requestHeaders = {};
  const rawHeaders = [];
  if (options.authorization) {
    requestHeaders.authorization = options.authorization;
    rawHeaders.push('Authorization', options.authorization);
  }
  if (options.origin) requestHeaders.origin = options.origin;
  const response = {
    statusCode: 200,
    payload: null,
    setHeader(name, value) { headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
  handler({ method: options.method, headers: requestHeaders, rawHeaders }, response);
  return response;
}
