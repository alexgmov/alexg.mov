import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
  authorizedOriginRequest,
  configuredHost,
  configuredOriginSecret,
} = require('../lib/hetzner-runtime');

test('the Hetzner service can bind only to loopback', () => {
  assert.equal(configuredHost({ SIDESTREAM_HETZNER_RUNTIME: '1' }), '127.0.0.1');
  assert.equal(configuredHost({ SIDESTREAM_HETZNER_RUNTIME: '1', HOST: '::1' }), '::1');
  assert.throws(
    () => configuredHost({ SIDESTREAM_HETZNER_RUNTIME: '1', HOST: '0.0.0.0' }),
    /loopback/,
  );
});

test('the Hetzner origin secret is mandatory and checked without prefix matching', () => {
  const secret = '0123456789abcdef0123456789abcdef';
  assert.equal(configuredOriginSecret({
    SIDESTREAM_HETZNER_RUNTIME: '1',
    SIDESTREAM_ORIGIN_AUTH_SECRET: secret,
  }), secret);
  assert.throws(
    () => configuredOriginSecret({ SIDESTREAM_HETZNER_RUNTIME: '1' }),
    /must be 32-512/,
  );
  assert.equal(authorizedOriginRequest({
    headers: { 'x-sidestream-origin-auth': secret },
  }, secret), true);
  assert.equal(authorizedOriginRequest({
    headers: { 'x-sidestream-origin-auth': `${secret}extra` },
  }, secret), false);
});
