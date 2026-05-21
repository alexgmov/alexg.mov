const {
  recordPluginTelemetryBatch,
  tryRecord,
} = require('../lib/supabase-db');
const {
  logEvent,
  readBody,
  safeJsonParse,
} = require('../lib/analytics-store');

const MAX_BODY_BYTES = 256 * 1024;
const MAX_EVENTS_PER_BATCH = 100;
const ENDPOINT_VERSION = '2026-05-21.1';

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Telemetry accepts POST only' });
  }

  if (process.env.SIDESTREAM_TELEMETRY_ENABLED === '0') {
    return res.status(202).json({ ok: true, disabled: true, accepted: 0, recorded: 0 });
  }

  let body;
  try {
    body = safeJsonParse(await readBody(req, MAX_BODY_BYTES));
  } catch {
    return res.status(400).json({ error: 'Invalid telemetry body' });
  }

  const events = sanitizeTelemetryEvents(body.events);
  if (!events.length) {
    return res.status(202).json({ ok: true, accepted: 0, recorded: 0 });
  }

  const result = await tryRecord('sidestream plugin telemetry', () => recordPluginTelemetryBatch({
    events,
    req,
    endpointVersion: ENDPOINT_VERSION,
  }));

  await logEvent({
    type: 'sidestream_plugin_telemetry_received',
    source: 'plugin_telemetry',
    endpointVersion: ENDPOINT_VERSION,
    accepted: events.length,
    recorded: result?.recorded || 0,
    skipped: Boolean(result?.skipped),
    errored: Boolean(result?.error),
  });

  return res.status(result?.error ? 202 : 200).json({
    ok: true,
    accepted: events.length,
    recorded: result?.recorded || 0,
    skipped: Boolean(result?.skipped),
  });
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sanitizeTelemetryEvents(events) {
  if (!Array.isArray(events)) return [];

  return events.slice(0, MAX_EVENTS_PER_BATCH)
    .map(event => {
      if (!event || typeof event !== 'object') return null;
      if (!event.id || !event.event_name) return null;

      return {
        id: sanitizeString(event.id, 120),
        install_id_hash: sanitizeString(event.install_id_hash, 128),
        session_id: sanitizeString(event.session_id, 128),
        sequence: Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : null,
        event_name: sanitizeString(event.event_name, 120),
        event_scope: sanitizeString(event.event_scope, 80),
        event_level: sanitizeString(event.event_level, 40),
        occurred_at: sanitizeIso(event.occurred_at),
        app_name: sanitizeString(event.app_name, 80),
        app_version: sanitizeString(event.app_version, 40),
        build_channel: sanitizeString(event.build_channel, 40),
        schema_version: sanitizeString(event.schema_version, 40),
        consent_state: sanitizeString(event.consent_state, 40),
        payload: sanitizeObject(event.payload, 32 * 1024),
        data_points: sanitizeObject(event.data_points, 32 * 1024),
      };
    })
    .filter(Boolean);
}

function sanitizeString(value, maxLength) {
  return String(value || '').slice(0, maxLength);
}

function sanitizeIso(value) {
  const text = sanitizeString(value, 40);
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function sanitizeObject(value, maxLength) {
  if (!value || typeof value !== 'object') return {};
  try {
    const text = JSON.stringify(value);
    if (text.length > maxLength) {
      return {
        _truncated: true,
        originalLength: text.length,
      };
    }
    return JSON.parse(text);
  } catch {
    return {};
  }
}
