const {
  recordPluginTelemetryBatch,
} = require('../lib/postgres-db');
const {
  logEvent,
  readBody,
  safeJsonParse,
} = require('../lib/analytics-store');

const MAX_BODY_BYTES = 512 * 1024;
const MAX_EVENTS_PER_BATCH = 100;
const ENDPOINT_VERSION = '2026-06-18.1';
const VALID_CATEGORIES = new Set([
  'user_action',
  'runtime_status',
  'search',
  'preview',
  'download',
  'postprocess',
  'import',
  'settings',
  'update',
  'install',
  'error',
]);
const VALID_SEVERITIES = new Set(['info', 'warning', 'error']);

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

  let rawBody;
  let body;
  try {
    rawBody = await readBody(req, MAX_BODY_BYTES);
    if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Telemetry body too large' });
    }
    body = safeJsonParse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid telemetry body' });
  }

  const events = sanitizeTelemetryEvents(body.events);
  if (!events.length) {
    return res.status(202).json({ ok: true, accepted: 0, recorded: 0 });
  }

  const result = await recordTelemetrySafely({
    events,
    req,
    endpointVersion: ENDPOINT_VERSION,
  });
  const recorded = result?.recorded || 0;
  const strictSuccess = !result?.error &&
    !result?.skipped &&
    recorded === events.length;
  const responseError = result?.error ||
    (result?.skipped
      ? 'Telemetry database is not configured.'
      : 'Telemetry collector did not record every accepted event.');

  await logEvent({
    type: 'sidestream_plugin_telemetry_received',
    source: 'plugin_telemetry',
    endpointVersion: ENDPOINT_VERSION,
    accepted: events.length,
    recorded,
    acknowledged: strictSuccess,
    partial: recorded !== events.length,
    skipped: Boolean(result?.skipped),
    errored: Boolean(result?.error),
    collector: result?.collector || '',
    legacySchema: Boolean(result?.legacySchema),
    rollupsSkipped: Boolean(result?.rollupsSkipped),
  });

  return res.status(strictSuccess ? 200 : 503).json({
    ok: strictSuccess,
    accepted: events.length,
    recorded,
    skipped: Boolean(result?.skipped),
    collector: result?.collector || '',
    error: strictSuccess ? undefined : responseError,
  });
};

async function recordTelemetrySafely(options) {
  try {
    return await recordPluginTelemetryBatch(options);
  } catch (err) {
    console.error('[postgres] sidestream plugin telemetry failed:', err.message);
    return { error: err.message, recorded: 0 };
  }
}

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
      const consentState = sanitizeConsentState(event.consent_state);

      return {
        id: sanitizeString(event.id, 120),
        install_id_hash: sanitizeString(event.install_id_hash, 128),
        support_code: sanitizeString(event.support_code, 40),
        session_id: sanitizeString(event.session_id, 128),
        sequence: Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : null,
        event_name: sanitizeString(event.event_name, 120),
        event_category: sanitizeCategory(event.event_category),
        event_scope: sanitizeString(event.event_scope, 80),
        event_level: sanitizeString(event.event_level, 40),
        severity: sanitizeSeverity(event.severity || event.event_level),
        error_class: sanitizeTelemetryLabel(event.error_class, 80),
        action_name: sanitizeTelemetryLabel(event.action_name, 120),
        batch_id: sanitizeString(event.batch_id, 120),
        occurred_at: sanitizeIso(event.occurred_at),
        app_name: sanitizeString(event.app_name, 80),
        app_version: sanitizeString(event.app_version, 40),
        build_channel: sanitizeString(event.build_channel, 40),
        schema_version: sanitizeString(event.schema_version, 40),
        payload_redaction_version: sanitizeString(event.payload_redaction_version, 40),
        consent_state: consentState.text,
        consent_state_payload: consentState.payload,
        payload: sanitizeObject(event.payload, 48 * 1024),
        data_points: sanitizeObject(event.data_points, 48 * 1024),
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

function sanitizeTelemetryLabel(value, maxLength) {
  const text = sanitizeString(value, maxLength || 120)
    .trim()
    .replace(/[^a-z0-9_.:-]/gi, '_')
    .replace(/_+/g, '_');
  return text || '';
}

function sanitizeCategory(value) {
  const category = sanitizeTelemetryLabel(value, 40);
  return VALID_CATEGORIES.has(category) ? category : 'runtime_status';
}

function sanitizeSeverity(value) {
  const severity = sanitizeTelemetryLabel(value, 20);
  if (severity === 'warn') return 'warning';
  return VALID_SEVERITIES.has(severity) ? severity : 'info';
}

function sanitizeConsentState(value) {
  const payload = sanitizeObject(value && typeof value === 'object' ? value : {}, 4 * 1024);

  if (!value || typeof value !== 'object') {
    const text = sanitizeString(value || 'unknown', 120);
    return {
      text,
      payload: text ? { legacy: text } : {},
    };
  }

  return {
    text: [
      `analytics:${payload.analytics === false ? 'off' : 'on'}`,
      `diagnostics:${payload.diagnostics === false ? 'off' : 'on'}`,
      `support:${payload.supportUpload === true ? 'on' : 'off'}`,
      payload.noticeVersion ? `notice:${sanitizeString(payload.noticeVersion, 40)}` : '',
    ].filter(Boolean).join(','),
    payload,
  };
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
