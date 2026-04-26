function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return String(value || '').split(',')[0].trim();
}

function hostNameFromHeader(host) {
  const value = firstHeaderValue(host).toLowerCase();
  if (!value) return '';
  if (value.startsWith('[')) return value.slice(1, value.indexOf(']'));
  return value.split(':')[0];
}

function normalizeAddress(address = '') {
  return String(address || '').replace(/^::ffff:/, '').toLowerCase();
}

function isLocalAddress(address) {
  const value = normalizeAddress(address);
  return value === 'localhost' || value === '127.0.0.1' || value === '::1';
}

function isLocalDashboardRequest(req) {
  if (process.env.ANALYTICS_DASHBOARD_ALLOW_REMOTE === '1') return true;
  const host = hostNameFromHeader(req.headers['x-forwarded-host'] || req.headers.host);
  const remoteAddress = req.socket?.remoteAddress || '';
  return isLocalAddress(host) && isLocalAddress(remoteAddress);
}

function denyNonLocal(req, res) {
  if (isLocalDashboardRequest(req)) return false;
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Analytics dashboard is local-only. Open it from localhost or set ANALYTICS_DASHBOARD_ALLOW_REMOTE=1.');
  return true;
}

module.exports = {
  denyNonLocal,
  isLocalDashboardRequest,
};
