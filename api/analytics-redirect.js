const { denyNonLocal } = require('../lib/analytics-dashboard-auth');

module.exports = async function handler(req, res) {
  if (denyNonLocal(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  res.statusCode = 302;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', '/analytics');
  res.end();
};
