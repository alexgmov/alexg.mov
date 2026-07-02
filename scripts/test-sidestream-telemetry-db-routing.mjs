import assert from 'node:assert/strict';
import telemetryDb from '../lib/sidestream-telemetry-db.js';

const {
  getSidestreamTelemetryCollectorConfig,
  getSidestreamTelemetryDatabaseConfig,
  isLegacySupabaseTelemetryEnabled,
} = telemetryDb;

const NEON_PRIMARY = 'postgresql://app:secret@ep-primary-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
const NEON_SECONDARY = 'postgresql://app:secret@ep-secondary.us-west-2.aws.neon.tech/neondb?sslmode=require';
const SUPABASE_POOLER = 'postgresql://postgres.project:secret@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const SUPABASE_REST_ENV = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_service_role_key',
};

function assertDatabaseEnv(env, expectedEnvName, message) {
  const selected = getSidestreamTelemetryDatabaseConfig(env);
  assert.equal(selected?.envName, expectedEnvName, message);
}

function assertCollector(env, expectedType, expectedLegacy, message) {
  const selected = getSidestreamTelemetryCollectorConfig(env);
  assert.equal(selected?.type || null, expectedType, message);
  assert.equal(Boolean(selected?.legacy), expectedLegacy, `${message} legacy flag`);
}

assertDatabaseEnv({
  SIDESTREAM_NEON_DATABASE_URL: NEON_PRIMARY,
  NEON_DATABASE_URL: NEON_SECONDARY,
  DATABASE_URL: NEON_SECONDARY,
  POSTGRES_URL: NEON_SECONDARY,
  ...SUPABASE_REST_ENV,
  SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY: '1',
}, 'SIDESTREAM_NEON_DATABASE_URL', 'Sidestream Neon URL wins over every lower-priority telemetry database');

assertDatabaseEnv({
  NEON_DATABASE_URL: NEON_PRIMARY,
  DATABASE_URL: NEON_SECONDARY,
  POSTGRES_URL: NEON_SECONDARY,
}, 'NEON_DATABASE_URL', 'Generic Neon URL wins when Sidestream-specific Neon URL is absent');

assertDatabaseEnv({
  DATABASE_URL: NEON_PRIMARY,
  POSTGRES_URL: NEON_SECONDARY,
}, 'DATABASE_URL', 'DATABASE_URL wins over POSTGRES_URL when it is a Neon connection');

assertDatabaseEnv({
  DATABASE_URL: SUPABASE_POOLER,
  POSTGRES_URL: NEON_PRIMARY,
}, 'POSTGRES_URL', 'Non-Neon DATABASE_URL is ignored before checking Neon POSTGRES_URL');

assert.equal(
  getSidestreamTelemetryDatabaseConfig({
    DATABASE_URL: SUPABASE_POOLER,
    POSTGRES_URL: 'postgresql://localhost:5432/alexg',
  }),
  null,
  'DATABASE_URL and POSTGRES_URL are ignored when they are not Neon connections'
);

assertCollector(
  SUPABASE_REST_ENV,
  null,
  false,
  'legacy Supabase REST is not selected just because Supabase env vars exist'
);

assertCollector({
  ...SUPABASE_REST_ENV,
  SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY: '1',
}, 'supabase-rest', true, 'legacy Supabase REST requires explicit telemetry opt-in');

assertCollector({
  NEON_DATABASE_URL: NEON_PRIMARY,
  ...SUPABASE_REST_ENV,
  SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY: '1',
}, 'postgres', false, 'Neon/Postgres stays higher priority than explicitly enabled legacy Supabase REST');

assert.equal(
  isLegacySupabaseTelemetryEnabled({ SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY: '0' }),
  false,
  'legacy Supabase telemetry flag accepts only 1'
);

console.log('Sidestream telemetry database routing checks passed');
