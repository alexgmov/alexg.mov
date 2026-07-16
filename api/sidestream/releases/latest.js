const { logEvent } = require('../../../lib/analytics-store');

const SUPPORTED_CHANNELS = new Set(['stable']);
const WINDOWS_PLATFORM = 'win32-x64';
const SUPPORTED_PLATFORMS = new Set(['darwin-arm64', 'darwin-x64', WINDOWS_PLATFORM]);
const CANONICAL_RELEASE_ENDPOINT = 'https://sidestream.tv/api/releases/latest';
const CANONICAL_DOWNLOAD_ORIGIN = 'https://sidestream.tv';
const CANONICAL_DOWNLOAD_PATH = '/api/download';
const UPSTREAM_TIMEOUT_MS = 4000;
const MAX_UPSTREAM_MANIFEST_BYTES = 64 * 1024;

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
    manifest = await readCanonicalManifest({ channel, platform, currentVersion });
    validateManifest(manifest);
    validatePlatformManifest(manifest, platform);
    manifest = toPublicManifest(manifest);
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

async function readCanonicalManifest({ channel, platform, currentVersion }) {
  const endpoint = new URL(CANONICAL_RELEASE_ENDPOINT);
  endpoint.searchParams.set('channel', channel);
  if (platform) endpoint.searchParams.set('platform', platform);
  if (currentVersion) endpoint.searchParams.set('version', currentVersion);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      redirect: 'error',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`canonical manifest returned HTTP ${response.status}`);
    }

    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > MAX_UPSTREAM_MANIFEST_BYTES) {
      throw new Error('canonical manifest is too large');
    }

    const body = await response.text();
    if (Buffer.byteLength(body, 'utf8') > MAX_UPSTREAM_MANIFEST_BYTES) {
      throw new Error('canonical manifest is too large');
    }

    return JSON.parse(body);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new Error('canonical manifest request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
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

function validatePlatformManifest(manifest, platform) {
  if (platform === WINDOWS_PLATFORM) {
    if (String(manifest.artifact.type || '').toLowerCase() !== 'exe') {
      throw new Error('Windows release artifact must be an EXE');
    }
    if (!isCanonicalDownloadUrl(manifest.artifact.url, WINDOWS_PLATFORM)) {
      throw new Error('Windows artifact URL must use the canonical Windows download route');
    }
    if (!isCanonicalDownloadUrl(manifest.releaseNotesUrl, WINDOWS_PLATFORM)) {
      throw new Error('Windows release notes URL must use the canonical Windows download route');
    }
    return;
  }

  if (String(manifest.artifact.type || '').toLowerCase() !== 'dmg') {
    throw new Error('Mac release artifact must be a DMG');
  }
  if (!isCanonicalDownloadUrl(manifest.artifact.url)) {
    throw new Error('Mac artifact URL must use the canonical Mac download route');
  }
}

function isCanonicalDownloadUrl(value, platform = '') {
  try {
    const url = new URL(String(value || ''));
    const params = Array.from(url.searchParams.entries());
    if (url.origin !== CANONICAL_DOWNLOAD_ORIGIN || url.pathname !== CANONICAL_DOWNLOAD_PATH) {
      return false;
    }
    if (!platform) return params.length === 0;
    return params.length === 1 && params[0][0] === 'platform' && params[0][1] === platform;
  } catch {
    return false;
  }
}

function toPublicManifest(manifest) {
  return {
    schemaVersion: manifest.schemaVersion,
    product: manifest.product,
    channel: manifest.channel,
    version: manifest.version,
    minSupportedVersion: manifest.minSupportedVersion,
    critical: Boolean(manifest.critical),
    rolloutPercent: Number(manifest.rolloutPercent),
    publishedAt: String(manifest.publishedAt || ''),
    releaseNotesUrl: String(manifest.releaseNotesUrl || ''),
    artifact: {
      type: String(manifest.artifact.type || ''),
      url: String(manifest.artifact.url || ''),
      sha256: String(manifest.artifact.sha256 || ''),
      sizeBytes: Number(manifest.artifact.sizeBytes),
    },
  };
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
