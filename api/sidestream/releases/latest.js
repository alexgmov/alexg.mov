const fs = require('fs');
const path = require('path');
const { logEvent } = require('../../../lib/analytics-store');

const DEFAULT_MANIFEST_PATH = path.join(__dirname, '../../../data/sidestream-release-manifest.json');
const SUPPORTED_CHANNELS = new Set(['stable']);
const SUPPORTED_PLATFORMS = new Set(['darwin-arm64', 'darwin-x64']);

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.status(405).json({ error: 'Release manifest accepts GET only' });
  }

  const requestUrl = new URL(req.url, 'https://alexg.mov');
  const channel = sanitizeLabel(requestUrl.searchParams.get('channel') || 'stable');
  const platform = sanitizeLabel(requestUrl.searchParams.get('platform') || '');
  const currentVersion = sanitizeVersion(requestUrl.searchParams.get('version') || '');

  if (!SUPPORTED_CHANNELS.has(channel)) {
    return res.status(404).json({ error: 'Release channel not found' });
  }

  if (platform && !SUPPORTED_PLATFORMS.has(platform)) {
    return res.status(404).json({ error: 'Platform release not found' });
  }

  let manifest;
  try {
    manifest = readManifest();
    validateManifest(manifest);
  } catch (err) {
    console.error('[sidestream releases] manifest unavailable:', err.message);
    await logManifestRequest(req, {
      channel,
      platform,
      currentVersion,
      status: 'manifest_error',
      error: err.message,
    });
    return res.status(503).json({ error: 'Release manifest is not available' });
  }

  if (manifest.product !== 'sidestream' || manifest.channel !== channel) {
    return res.status(404).json({ error: 'Release manifest not found' });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  await logManifestRequest(req, {
    channel,
    platform,
    currentVersion,
    status: 'served',
    latestVersion: manifest.version,
  });

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).json(manifest);
};

function readManifest() {
  const manifestPath = process.env.SIDESTREAM_RELEASE_MANIFEST_PATH || DEFAULT_MANIFEST_PATH;
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new Error('manifest object missing');
  if (manifest.schemaVersion !== 1) throw new Error('unsupported manifest schema');
  if (manifest.product !== 'sidestream') throw new Error('manifest product mismatch');
  if (!SUPPORTED_CHANNELS.has(manifest.channel)) throw new Error('unsupported manifest channel');
  if (!isSemver(manifest.version)) throw new Error('invalid release version');
  if (!isSemver(manifest.minSupportedVersion)) throw new Error('invalid min supported version');
  if (!Number.isFinite(Number(manifest.rolloutPercent))) throw new Error('invalid rollout percent');
  if (!manifest.artifact || typeof manifest.artifact !== 'object') throw new Error('artifact missing');
  if (!/^https:\/\//.test(String(manifest.artifact.url || ''))) throw new Error('artifact url must be https');
  if (!/^[a-f0-9]{64}$/i.test(String(manifest.artifact.sha256 || ''))) throw new Error('artifact sha256 missing');
  if (!Number.isFinite(Number(manifest.artifact.sizeBytes)) || Number(manifest.artifact.sizeBytes) <= 0) {
    throw new Error('artifact size missing');
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sanitizeLabel(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40);
}

function sanitizeVersion(value) {
  return String(value || '').trim().replace(/^v/i, '').replace(/[^0-9A-Za-z.+-]/g, '').slice(0, 40);
}

function isSemver(value) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(value || ''));
}

async function logManifestRequest(req, details) {
  try {
    await logEvent({
      type: 'sidestream_release_manifest_request',
      source: 'sidestream_release_manifest',
      path: normalizeRequestPath(req),
      channel: details.channel,
      platform: details.platform,
      currentVersion: details.currentVersion,
      latestVersion: details.latestVersion,
      status: details.status,
      error: details.error,
    });
  } catch (err) {
    console.error('[sidestream releases] analytics failed:', err.message);
  }
}

function normalizeRequestPath(req) {
  try {
    const url = new URL(req.url, 'https://alexg.mov');
    return url.pathname;
  } catch {
    return '/api/sidestream/releases/latest';
  }
}
