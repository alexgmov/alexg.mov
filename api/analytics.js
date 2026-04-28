const {
  ensureVisitorIds,
  logEvent,
  readBody,
  safeJsonParse,
} = require('../lib/analytics-store');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Analytics accepts POST events only' });
  }

  let payload;
  try {
    payload = safeJsonParse(await readBody(req));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid analytics payload' });
  }

  const ids = ensureVisitorIds(req, res);
  const events = Array.isArray(payload.events) ? payload.events : [payload];
  const logged = [];

  for (const event of events.slice(0, 25)) {
    logged.push(await logEvent({
      ...event,
      source: 'client',
      visitorId: event.visitorId || ids.visitorId,
      sessionId: event.sessionId || ids.sessionId,
      visitorHash: ids.visitorHash,
      receivedAt: new Date().toISOString(),
    }));
  }

  return res.status(202).json({ ok: true, logged: logged.length });
};
