const {
  readEvents,
  summarizeEvents,
} = require('./analytics-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Analytics report accepts GET only' });
  }

  const url = new URL(req.url, 'http://x');
  const token = url.searchParams.get('token') || req.headers['x-analytics-token'];
  if (!process.env.ANALYTICS_ADMIN_TOKEN || token !== process.env.ANALYTICS_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Analytics report requires ANALYTICS_ADMIN_TOKEN' });
  }

  const limit = Math.min(50000, Math.max(100, parseInt(url.searchParams.get('limit') || '5000', 10)));
  const events = await readEvents({ limit });
  return res.json(summarizeEvents(events));
};
