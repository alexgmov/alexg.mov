#!/usr/bin/env node

const DIRECT_NEON_ENV_NAMES = [
  'SIDESTREAM_NEON_DATABASE_URL',
  'NEON_DATABASE_URL',
];

const GENERIC_POSTGRES_ENV_NAMES = [
  'DATABASE_URL',
  'POSTGRES_URL',
];

const LEGACY_SUPABASE_ENV_NAMES = [
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_POSTGRES_URL',
];

const LEGACY_FALLBACK_FLAG = 'SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY';

function hasValue(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function getUrl(value) {
  if (!hasValue(value)) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getHostname(value) {
  return getUrl(value)?.hostname.toLowerCase() || null;
}

function isNeonConnectionString(value) {
  const hostname = getHostname(value);
  return hostname === 'neon.tech' || hostname?.endsWith('.neon.tech') || false;
}

function redactedValue(value) {
  if (!hasValue(value)) {
    return '<unset>';
  }

  const parsed = getUrl(value);
  if (!parsed) {
    return `<set:${value.trim().length} chars>`;
  }

  const auth = parsed.username || parsed.password ? '<credentials>@' : '';
  const port = parsed.port ? `:${parsed.port}` : '';
  return `${parsed.protocol}//${auth}${parsed.hostname}${port}/...`;
}

function inspectEnvironment(env) {
  const directNeon = DIRECT_NEON_ENV_NAMES
    .filter((name) => hasValue(env[name]))
    .map((name) => ({
      name,
      value: env[name],
      accepted: true,
      reason: 'explicit Sidestream/Neon env var',
    }));

  const genericPostgres = GENERIC_POSTGRES_ENV_NAMES
    .filter((name) => hasValue(env[name]))
    .map((name) => ({
      name,
      value: env[name],
      accepted: isNeonConnectionString(env[name]),
      reason: isNeonConnectionString(env[name])
        ? 'generic database URL points at Neon'
        : 'generic database URL is not a Neon host for Sidestream telemetry',
    }));

  const acceptedNeon = [
    ...directNeon,
    ...genericPostgres.filter((entry) => entry.accepted),
  ];

  const ignoredGenericPostgres = genericPostgres.filter((entry) => !entry.accepted);

  const legacySupabase = LEGACY_SUPABASE_ENV_NAMES
    .filter((name) => hasValue(env[name]))
    .map((name) => ({
      name,
      value: env[name],
    }));

  const legacyFallbackEnabled = env[LEGACY_FALLBACK_FLAG] === '1';
  const legacyFallbackSet = hasValue(env[LEGACY_FALLBACK_FLAG]);

  let verdict = 'missing Neon URL';
  if (legacyFallbackEnabled) {
    verdict = 'explicit legacy fallback enabled';
  } else if (acceptedNeon.length > 0 && legacySupabase.length > 0) {
    verdict = 'legacy Supabase present but inert';
  } else if (acceptedNeon.length > 0) {
    verdict = 'Neon configured';
  }

  return {
    verdict,
    acceptedNeon,
    ignoredGenericPostgres,
    legacySupabase,
    legacyFallbackEnabled,
    legacyFallbackSet,
    legacyFallbackValue: env[LEGACY_FALLBACK_FLAG],
  };
}

function printList(title, entries, renderEntry) {
  console.log(title);
  if (entries.length === 0) {
    console.log('  - none');
    return;
  }

  for (const entry of entries) {
    console.log(`  - ${renderEntry(entry)}`);
  }
}

function printReport(result) {
  console.log('Sidestream telemetry egress due-diligence check');
  console.log(`Verdict: ${result.verdict}`);
  console.log('');

  printList('Neon telemetry candidates accepted by routing:', result.acceptedNeon, (entry) => (
    `${entry.name}=${redactedValue(entry.value)} (${entry.reason})`
  ));

  console.log('');
  printList('Generic Postgres env vars ignored for Sidestream telemetry:', result.ignoredGenericPostgres, (entry) => (
    `${entry.name}=${redactedValue(entry.value)} (${entry.reason})`
  ));

  console.log('');
  printList('legacy Supabase env vars present in this process:', result.legacySupabase, (entry) => (
    `${entry.name}=${redactedValue(entry.value)}`
  ));

  console.log('');
  console.log('Legacy fallback gate:');
  if (result.legacyFallbackEnabled) {
    console.log(`  - ${LEGACY_FALLBACK_FLAG}=1 (legacy Supabase REST fallback is explicitly enabled)`);
  } else if (result.legacyFallbackSet) {
    console.log(`  - ${LEGACY_FALLBACK_FLAG}=${redactedValue(result.legacyFallbackValue)} (not equal to 1, fallback remains disabled)`);
  } else {
    console.log(`  - ${LEGACY_FALLBACK_FLAG}=<unset> (legacy Supabase REST fallback remains disabled)`);
  }

  console.log('');
  console.log('Practical next steps:');
  if (result.acceptedNeon.length === 0) {
    console.log('  - Set SIDESTREAM_NEON_DATABASE_URL or NEON_DATABASE_URL before relying on production telemetry imports.');
  } else {
    console.log('  - Keep the accepted Neon env var server-only; never expose it to the CEP extension, browser bundle, or FlowState dashboard.');
  }

  if (result.legacyFallbackEnabled) {
    console.log('  - Remove SIDESTREAM_ALLOW_LEGACY_SUPABASE_TELEMETRY=1 after the emergency fallback window closes.');
  } else if (result.legacySupabase.length > 0) {
    console.log('  - legacy Supabase REST vars may remain for business-ledger/history work, but they are inert for Sidestream telemetry without the fallback gate.');
    console.log('  - Remove legacy Supabase REST vars from Production once no other server path needs them.');
  } else {
    console.log('  - No legacy Supabase REST vars are visible to this process.');
  }

  console.log('  - Future dashboard work should use manual refresh or bounded scheduled imports, not high-frequency polling.');
  console.log('  - Avoid broad raw-event reads; use guarded summary/recent queries with time windows and result limits.');
}

printReport(inspectEnvironment(process.env));
