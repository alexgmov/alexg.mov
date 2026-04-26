const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ANALYTICS_VERSION = '2026-04-26.1';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const SESSION_SECONDS = 60 * 30;
const LOG_DIR = process.env.ANALYTICS_LOG_DIR ||
  (process.env.VERCEL ? '/tmp/alexg-analytics' : path.join(process.cwd(), '.analytics'));

const PERSONA_DEFINITIONS = {
  quick_buyer: 'Moves from product discovery to checkout quickly with little comparison behavior.',
  returning_lut_considerer: 'Returns after a prior LUT visit, usually with meaningful LUT page time and no purchase yet.',
  high_intent_lut_shopper: 'Spends meaningful time with LUT pages, previews, or buy CTAs.',
  plugin_workflow_evaluator: 'Studies FlowState, compatibility, install details, or support before deciding.',
  comparison_shopper: 'Views both plugin and LUT paths before taking a purchase action.',
  service_lead_candidate: 'Engages with services, portfolio, proof, or the brief email flow.',
  proof_seeker: 'Looks for portfolio, case studies, testimonials, or proof before product action.',
  support_policy_checker: 'Checks support, terms, refund, or compatibility information around product consideration.',
  checkout_hesitator: 'Clicks buy or starts checkout without a confirmed success event in the observed sequence.',
  portfolio_browser: 'Consumes portfolio/creative proof without moving into product or service conversion.',
  low_intent_bounce: 'Leaves after a short single-page visit.',
  general_explorer: 'Browses multiple areas without a clear purchase or lead signal yet.',
};

function readBody(req, maxBytes = 64 * 1024) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === 'string') return Promise.resolve(Buffer.from(req.body));
  if (req.rawBody) return Promise.resolve(Buffer.from(req.rawBody));
  if (typeof req.on !== 'function') return Promise.resolve(Buffer.from(JSON.stringify(req.body || {})));

  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', chunk => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Analytics payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseCookies(header = '') {
  return String(header || '').split(';').reduce((acc, part) => {
    const eq = part.indexOf('=');
    if (eq === -1) return acc;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function appendSetCookie(res, cookie) {
  const current = res.getHeader?.('Set-Cookie');
  if (!current) {
    res.setHeader('Set-Cookie', cookie);
    return;
  }
  const next = Array.isArray(current) ? current.concat(cookie) : [current, cookie];
  res.setHeader('Set-Cookie', next);
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function analyticsSalt() {
  return process.env.ANALYTICS_SALT || process.env.DOWNLOAD_SECRET || 'alexg-mov-dev-analytics-salt';
}

function hashValue(value) {
  return crypto
    .createHmac('sha256', analyticsSalt())
    .update(String(value || 'unknown'))
    .digest('hex')
    .slice(0, 32);
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return String(value || '').split(',')[0].trim();
}

function getClientFingerprint(req) {
  const ip = firstHeaderValue(req.headers['x-forwarded-for']) ||
    firstHeaderValue(req.headers['x-real-ip']) ||
    req.socket?.remoteAddress ||
    'unknown';
  const ua = req.headers['user-agent'] || '';
  return hashValue(`${ip}|${ua}`);
}

function ensureVisitorIds(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const createdVisitor = !cookies.agm_vid;
  const createdSession = !cookies.agm_sid;
  const visitorId = cookies.agm_vid || randomId('v');
  const sessionId = cookies.agm_sid || randomId('s');

  if (createdVisitor) {
    appendSetCookie(res, `agm_vid=${encodeURIComponent(visitorId)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`);
  }
  if (createdSession) {
    appendSetCookie(res, `agm_sid=${encodeURIComponent(sessionId)}; Path=/; Max-Age=${SESSION_SECONDS}; SameSite=Lax`);
  }

  return {
    visitorId,
    sessionId,
    visitorHash: getClientFingerprint(req),
    createdVisitor,
    createdSession,
  };
}

function pageFromUrl(url) {
  const pathname = url.pathname || '/';
  if (pathname === '/' || pathname.endsWith('.html')) {
    return url.searchParams.get('page') || 'home';
  }
  if (pathname === '/api/download') return 'download';
  if (pathname.startsWith('/api/')) return pathname.slice(1);
  const ext = path.extname(pathname).slice(1);
  if (ext) return `asset:${ext}`;
  return pathname.replace(/^\/+/, '') || 'home';
}

function redactQuery(url) {
  const redacted = {};
  const sensitive = new Set(['sig', 'signature', 'session_id', 'token', 'email', 'exp']);
  for (const [key, value] of url.searchParams.entries()) {
    if (sensitive.has(key.toLowerCase())) redacted[key] = '[redacted]';
    else redacted[key] = value;
  }
  return redacted;
}

function normalizePath(value = '') {
  try {
    const url = new URL(value, 'https://alexg.mov');
    return `${url.pathname}${url.search ? url.search : ''}${url.hash ? url.hash : ''}`;
  } catch {
    return String(value || '').slice(0, 500);
  }
}

function sanitizeEvent(raw) {
  const event = raw && typeof raw === 'object' ? raw : {};
  const page = String(event.page || '').slice(0, 120);
  const type = String(event.type || 'client_event').slice(0, 80);
  const url = event.url ? normalizePath(event.url) : undefined;
  const referrer = event.referrer ? normalizePath(event.referrer) : undefined;

  return {
    ...event,
    analyticsVersion: ANALYTICS_VERSION,
    type,
    source: String(event.source || 'client').slice(0, 40),
    page: page || undefined,
    url,
    referrer,
    path: event.path ? String(event.path).slice(0, 500) : undefined,
    userAgent: event.userAgent ? String(event.userAgent).slice(0, 300) : undefined,
    visitorId: event.visitorId ? String(event.visitorId).slice(0, 80) : undefined,
    sessionId: event.sessionId ? String(event.sessionId).slice(0, 80) : undefined,
    visitorHash: event.visitorHash ? String(event.visitorHash).slice(0, 80) : undefined,
    persona: event.persona ? String(event.persona).slice(0, 80) : undefined,
    bottlenecks: Array.isArray(event.bottlenecks)
      ? event.bottlenecks.map(item => String(item).slice(0, 120)).slice(0, 12)
      : [],
    ts: event.ts || new Date().toISOString(),
  };
}

function logFilePath(date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return path.join(LOG_DIR, `events-${day}.jsonl`);
}

async function appendEvent(event) {
  await fs.promises.mkdir(LOG_DIR, { recursive: true });
  await fs.promises.appendFile(logFilePath(), `${JSON.stringify(event)}\n`);
}

async function logEvent(raw) {
  const event = sanitizeEvent(raw);
  if (process.env.ANALYTICS_CONSOLE !== '0') {
    console.log('[analytics]', JSON.stringify(event));
  }
  try {
    await appendEvent(event);
  } catch (err) {
    console.error('[analytics] failed to write event', err.message);
  }
  return event;
}

function trackGetRequest(req, res, url) {
  if (req.method !== 'GET') return null;
  const started = process.hrtime.bigint();
  const ids = ensureVisitorIds(req, res);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    const event = {
      type: 'request:get',
      source: 'server',
      method: 'GET',
      page: pageFromUrl(url),
      path: url.pathname,
      query: redactQuery(url),
      status: res.statusCode,
      durationMs: Math.round(durationMs),
      contentType: firstHeaderValue(res.getHeader?.('Content-Type')),
      contentLength: Number(res.getHeader?.('Content-Length')) || undefined,
      referrer: req.headers.referer || req.headers.referrer || '',
      userAgent: req.headers['user-agent'] || '',
      visitorId: ids.visitorId,
      sessionId: ids.sessionId,
      visitorHash: ids.visitorHash,
      createdVisitor: ids.createdVisitor,
      createdSession: ids.createdSession,
    };
    logEvent(event);
  });

  return ids;
}

function safeJsonParse(buffer) {
  const text = Buffer.isBuffer(buffer) ? buffer.toString('utf8') : String(buffer || '');
  if (!text.trim()) return {};
  return JSON.parse(text);
}

async function readEvents({ limit = 5000 } = {}) {
  let files = [];
  try {
    files = await fs.promises.readdir(LOG_DIR);
  } catch {
    return [];
  }

  const jsonlFiles = files
    .filter(file => /^events-\d{4}-\d{2}-\d{2}\.jsonl$/.test(file))
    .sort()
    .reverse();
  const events = [];

  for (const file of jsonlFiles) {
    const fullPath = path.join(LOG_DIR, file);
    const text = await fs.promises.readFile(fullPath, 'utf8');
    const lines = text.trim().split('\n').filter(Boolean).reverse();
    for (const line of lines) {
      try {
        events.push(JSON.parse(line));
      } catch {}
      if (events.length >= limit) return events.reverse();
    }
  }

  return events.reverse();
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round(sorted[index]);
}

function summarizeEvents(events) {
  const typeCounts = {};
  const personaCounts = {};
  const bottleneckCounts = {};
  const pageViews = {};
  const durations = {};
  const sessions = new Map();
  const funnel = {
    productViews: 0,
    buyClicks: 0,
    checkoutSuccessViews: 0,
    downloadRequests: 0,
    leadClicks: 0,
  };

  for (const event of events) {
    typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
    if (event.persona) personaCounts[event.persona] = (personaCounts[event.persona] || 0) + 1;
    for (const item of event.bottlenecks || []) {
      bottleneckCounts[item] = (bottleneckCounts[item] || 0) + 1;
    }

    if (event.type === 'page_view') {
      pageViews[event.page || 'unknown'] = (pageViews[event.page || 'unknown'] || 0) + 1;
      if (String(event.page || '').startsWith('plugin:') || String(event.page || '').startsWith('lut:')) {
        funnel.productViews += 1;
      }
    }
    if (event.type === 'page_duration') {
      const page = event.page || 'unknown';
      durations[page] = durations[page] || [];
      durations[page].push(Number(event.activeMs || event.durationMs || 0));
    }
    if (event.type === 'buy_click') funnel.buyClicks += 1;
    if (event.type === 'checkout_success_view') funnel.checkoutSuccessViews += 1;
    if (event.type === 'request:get' && event.path === '/api/download' && event.status === 200) funnel.downloadRequests += 1;
    if (event.type === 'lead_click') funnel.leadClicks += 1;

    const sessionKey = event.sessionId || event.visitorHash || 'unknown';
    if (!sessions.has(sessionKey)) sessions.set(sessionKey, []);
    sessions.get(sessionKey).push(event);
  }

  const pageDurations = Object.fromEntries(Object.entries(durations).map(([page, values]) => [
    page,
    {
      count: values.length,
      medianActiveMs: percentile(values, 50),
      p75ActiveMs: percentile(values, 75),
      p90ActiveMs: percentile(values, 90),
    },
  ]));

  const paths = {};
  for (const sessionEvents of sessions.values()) {
    const route = sessionEvents
      .filter(event => event.type === 'page_view')
      .map(event => event.page || 'unknown')
      .filter((page, index, list) => index === 0 || list[index - 1] !== page)
      .slice(0, 8)
      .join(' > ');
    if (route) paths[route] = (paths[route] || 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    analyticsVersion: ANALYTICS_VERSION,
    eventCount: events.length,
    sessionCount: sessions.size,
    typeCounts,
    pageViews,
    pageDurations,
    personaCounts,
    bottleneckCounts,
    funnel,
    topPaths: Object.entries(paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pathName, count]) => ({ path: pathName, count })),
    personaDefinitions: PERSONA_DEFINITIONS,
  };
}

module.exports = {
  PERSONA_DEFINITIONS,
  ensureVisitorIds,
  logEvent,
  readBody,
  readEvents,
  safeJsonParse,
  summarizeEvents,
  trackGetRequest,
};
