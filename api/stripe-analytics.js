const Stripe = require('stripe');

function dollars(amount, currency = 'usd') {
  if (amount == null) return null;
  const divisor = zeroDecimalCurrency(currency) ? 1 : 100;
  return amount / divisor;
}

function zeroDecimalCurrency(currency = '') {
  return [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf',
    'xof', 'xpf',
  ].includes(String(currency).toLowerCase());
}

async function listAllEvents(stripe, type, created) {
  const events = [];
  let startingAfter;
  do {
    const page = await stripe.events.list({
      type,
      created,
      limit: 100,
      starting_after: startingAfter,
    });
    events.push(...page.data);
    startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : null;
  } while (startingAfter && events.length < 1000);
  return events;
}

async function getStripeSnapshot({ sinceUnix, limit = 100 } = {}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      configured: false,
      error: 'STRIPE_SECRET_KEY is not configured',
      sessions: [],
      summary: emptySummary(),
      lifecycleNote: stripeLifecycleNote(),
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const created = sinceUnix ? { gte: sinceUnix } : undefined;
  const max = Math.min(100, Math.max(1, Number(limit) || 100));

  try {
    const [sessionsPage, completedEvents, expiredEvents] = await Promise.all([
      stripe.checkout.sessions.list({ limit: max, created }),
      listAllEvents(stripe, 'checkout.session.completed', created),
      listAllEvents(stripe, 'checkout.session.expired', created),
    ]);

    const completedAtBySession = eventMap(completedEvents);
    const expiredAtBySession = eventMap(expiredEvents);
    const sessions = sessionsPage.data.map(session => normalizeSession(
      session,
      completedAtBySession.get(session.id),
      expiredAtBySession.get(session.id)
    ));

    return {
      configured: true,
      fetchedAt: new Date().toISOString(),
      sessions,
      summary: summarizeStripeSessions(sessions),
      lifecycleNote: stripeLifecycleNote(),
    };
  } catch (err) {
    return {
      configured: true,
      error: err.message || 'Failed to load Stripe analytics',
      sessions: [],
      summary: emptySummary(),
      lifecycleNote: stripeLifecycleNote(),
    };
  }
}

function eventMap(events) {
  const map = new Map();
  for (const event of events) {
    const sessionId = event.data?.object?.id;
    if (sessionId && !map.has(sessionId)) map.set(sessionId, event.created);
  }
  return map;
}

function normalizeSession(session, completedAt, expiredAt) {
  const currency = session.currency || 'usd';
  const productId = session.metadata?.productId || 'unknown';
  const completedUnix = completedAt || null;
  const expiredUnix = expiredAt || (session.status === 'expired' ? session.expires_at : null);

  return {
    id: session.id,
    created: session.created,
    createdAt: unixIso(session.created),
    completed: completedUnix,
    completedAt: unixIso(completedUnix),
    expired: expiredUnix,
    expiredAt: unixIso(expiredUnix),
    status: session.status || 'unknown',
    paymentStatus: session.payment_status || 'unknown',
    productId,
    amountTotal: session.amount_total || 0,
    amountSubtotal: session.amount_subtotal || 0,
    currency,
    value: dollars(session.amount_total || 0, currency),
    mode: session.mode || 'payment',
    customerCountry: session.customer_details?.address?.country || null,
    lifecycleSeconds: completedUnix ? completedUnix - session.created : null,
  };
}

function summarizeStripeSessions(sessions) {
  const summary = emptySummary();
  summary.sessions = sessions.length;

  for (const session of sessions) {
    summary.statusCounts[session.status] = (summary.statusCounts[session.status] || 0) + 1;
    summary.paymentStatusCounts[session.paymentStatus] = (summary.paymentStatusCounts[session.paymentStatus] || 0) + 1;
    summary.productCounts[session.productId] = (summary.productCounts[session.productId] || 0) + 1;

    if (session.paymentStatus === 'paid') {
      summary.paid += 1;
      summary.revenue += session.value || 0;
    }
    if (session.status === 'open') summary.open += 1;
    if (session.status === 'expired') summary.expired += 1;
    if (session.status === 'complete') summary.complete += 1;
    if (session.lifecycleSeconds != null) summary.lifecycleSeconds.push(session.lifecycleSeconds);
  }

  summary.revenue = Math.round(summary.revenue * 100) / 100;
  summary.averageOrderValue = summary.paid
    ? Math.round((summary.revenue / summary.paid) * 100) / 100
    : 0;
  summary.medianLifecycleSeconds = median(summary.lifecycleSeconds);
  delete summary.lifecycleSeconds;

  return summary;
}

function emptySummary() {
  return {
    sessions: 0,
    paid: 0,
    complete: 0,
    open: 0,
    expired: 0,
    revenue: 0,
    averageOrderValue: 0,
    medianLifecycleSeconds: 0,
    statusCounts: {},
    paymentStatusCounts: {},
    productCounts: {},
    lifecycleSeconds: [],
  };
}

function median(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function unixIso(value) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function stripeLifecycleNote() {
  return 'Stripe-hosted Checkout does not expose heatmaps, field focus, or internal page-click telemetry through the Stripe API. This dashboard uses real Checkout Session lifecycle data: created, open, complete, expired, paid, amount, product metadata, and completion timing.';
}

module.exports = {
  getStripeSnapshot,
};
