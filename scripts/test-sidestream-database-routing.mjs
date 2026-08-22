import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { resolveDatabaseUrl } = require('../lib/postgres-db');

const ROUTING_ENV_KEYS = [
  'SIDESTREAM_NEON_DATABASE_URL',
  'SIDESTREAM_HETZNER_POSTGRES_URL',
  'SIDESTREAM_HETZNER_RUNTIME',
  'NEON_DATABASE_URL',
  'DATABASE_URL',
  'POSTGRES_URL',
  'NODE_ENV',
  'VERCEL',
  'VERCEL_ENV',
];

const sidestreamNeonUrl = 'postgresql://sidestream:secret@ep-sidestream.us-west-2.aws.neon.tech/sidestream';
const generalNeonUrl = 'postgresql://neon:secret@ep-general.us-west-2.aws.neon.tech/general';
const databaseUrl = 'postgresql://database:secret@ep-database.us-west-2.aws.neon.tech/database';
const postgresUrl = 'postgresql://postgres:secret@ep-postgres.us-west-2.aws.neon.tech/postgres';
const stalePoolerUrl = 'postgresql://postgres:secret@aws-1-us-west-1.pooler.supabase.com:6543/postgres';
const localUrl = 'postgresql://postgres:secret@localhost:5432/alexg';

function withRoutingEnv(overrides, callback) {
  const previous = Object.fromEntries(
    ROUTING_ENV_KEYS.map(key => [key, process.env[key]])
  );

  for (const key of ROUTING_ENV_KEYS) delete process.env[key];
  Object.assign(process.env, overrides);

  try {
    callback();
  } finally {
    for (const key of ROUTING_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test('database routing follows the Neon precedence contract', () => {
  const production = { NODE_ENV: 'production' };

  withRoutingEnv({
    ...production,
    SIDESTREAM_NEON_DATABASE_URL: sidestreamNeonUrl,
    NEON_DATABASE_URL: generalNeonUrl,
    DATABASE_URL: databaseUrl,
    POSTGRES_URL: postgresUrl,
  }, () => assert.equal(resolveDatabaseUrl(), sidestreamNeonUrl));

  withRoutingEnv({
    ...production,
    NEON_DATABASE_URL: generalNeonUrl,
    DATABASE_URL: databaseUrl,
    POSTGRES_URL: postgresUrl,
  }, () => assert.equal(resolveDatabaseUrl(), generalNeonUrl));

  withRoutingEnv({
    ...production,
    DATABASE_URL: databaseUrl,
    POSTGRES_URL: postgresUrl,
  }, () => assert.equal(resolveDatabaseUrl(), databaseUrl));

  withRoutingEnv({
    ...production,
    POSTGRES_URL: postgresUrl,
  }, () => assert.equal(resolveDatabaseUrl(), postgresUrl));
});

test('database routing rejects stale Supabase and other remote hosts', () => {
  withRoutingEnv({
    NODE_ENV: 'production',
    SIDESTREAM_NEON_DATABASE_URL: stalePoolerUrl,
    DATABASE_URL: databaseUrl,
  }, () => assert.equal(resolveDatabaseUrl(), databaseUrl));

  withRoutingEnv({
    NODE_ENV: 'production',
    DATABASE_URL: stalePoolerUrl,
    POSTGRES_URL: 'postgresql://postgres:secret@db.example.com:5432/postgres',
  }, () => assert.equal(resolveDatabaseUrl(), ''));
});

test('database routing allows localhost only during local development', () => {
  withRoutingEnv({
    NODE_ENV: 'development',
    POSTGRES_URL: localUrl,
  }, () => assert.equal(resolveDatabaseUrl(), localUrl));

  withRoutingEnv({
    NODE_ENV: 'production',
    POSTGRES_URL: localUrl,
  }, () => assert.equal(resolveDatabaseUrl(), ''));

  withRoutingEnv({
    NODE_ENV: 'development',
    VERCEL: '1',
    POSTGRES_URL: localUrl,
  }, () => assert.equal(resolveDatabaseUrl(), ''));
});

test('database routing permits only an explicitly marked loopback Hetzner runtime', () => {
  withRoutingEnv({
    NODE_ENV: 'production',
    SIDESTREAM_HETZNER_RUNTIME: '1',
    SIDESTREAM_HETZNER_POSTGRES_URL: localUrl,
    SIDESTREAM_NEON_DATABASE_URL: sidestreamNeonUrl,
  }, () => assert.equal(resolveDatabaseUrl(), localUrl));

  withRoutingEnv({
    NODE_ENV: 'production',
    SIDESTREAM_HETZNER_POSTGRES_URL: localUrl,
    SIDESTREAM_NEON_DATABASE_URL: sidestreamNeonUrl,
  }, () => assert.equal(resolveDatabaseUrl(), sidestreamNeonUrl));

  withRoutingEnv({
    NODE_ENV: 'production',
    SIDESTREAM_HETZNER_RUNTIME: '1',
    SIDESTREAM_HETZNER_POSTGRES_URL:
      'postgresql://runtime:secret@10.0.0.12:5432/sidestream_telemetry',
  }, () => assert.equal(resolveDatabaseUrl(), ''));

  withRoutingEnv({
    NODE_ENV: 'production',
    VERCEL: '1',
    SIDESTREAM_HETZNER_RUNTIME: '1',
    SIDESTREAM_HETZNER_POSTGRES_URL: localUrl,
  }, () => assert.equal(resolveDatabaseUrl(), ''));
});
