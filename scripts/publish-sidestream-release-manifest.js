#!/usr/bin/env node
"use strict";

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const MANIFEST_PATH = process.env.SIDESTREAM_RELEASE_MANIFEST_PATH ||
  path.join(ROOT_DIR, 'data', 'sidestream-release-manifest.json');
const DEFAULT_RELEASE_NOTES_URL = 'https://alexg.mov/?page=sidestream-install';
const REQUIRED_GATES = ['signed', 'verified', 'uploaded', 'smoke-tested'];

main();

function main() {
  const args = parseArgs(process.argv.slice(2));
  const missingGates = REQUIRED_GATES.filter(name => args[name] !== true);

  if (args.help) {
    printUsage();
    return;
  }

  if (missingGates.length) {
    fail(`Refusing to publish. Missing release gates: ${missingGates.join(', ')}`);
  }

  const artifactPath = required(args.artifact, '--artifact');
  const artifactUrl = required(args['artifact-url'], '--artifact-url');
  const version = normalizeVersion(required(args.version, '--version'));
  const minSupportedVersion = normalizeVersion(args['min-supported-version'] || '1.0.0');
  const channel = sanitizeLabel(args.channel || 'stable');
  const rolloutPercent = normalizeRolloutPercent(args['rollout-percent'] || 100);
  const releaseNotesUrl = args['release-notes-url'] || DEFAULT_RELEASE_NOTES_URL;
  const publishedAt = args['published-at'] || new Date().toISOString();
  const artifactType = sanitizeLabel(args['artifact-type'] || 'dmg');
  const critical = parseBoolean(args.critical);

  if (channel !== 'stable') fail('Only the stable Sidestream release channel is supported right now.');
  if (!isSemver(version)) fail(`Invalid --version "${version}". Use x.y.z semver.`);
  if (!isSemver(minSupportedVersion)) fail(`Invalid --min-supported-version "${minSupportedVersion}".`);
  if (!isHttpsUrl(artifactUrl)) fail('--artifact-url must be an https URL.');
  if (!isHttpsUrl(releaseNotesUrl)) fail('--release-notes-url must be an https URL.');
  if (!fs.existsSync(artifactPath)) fail(`Artifact not found: ${artifactPath}`);

  const stats = fs.statSync(artifactPath);
  if (!stats.isFile() || stats.size <= 0) fail(`Artifact is not a readable file: ${artifactPath}`);

  const manifest = {
    schemaVersion: 1,
    product: 'sidestream',
    channel,
    version,
    minSupportedVersion,
    critical,
    rolloutPercent,
    publishedAt,
    releaseNotesUrl,
    artifact: {
      type: artifactType,
      url: artifactUrl,
      sha256: hashFile(artifactPath),
      sizeBytes: stats.size,
    },
  };

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Published Sidestream ${version} ${channel} manifest to ${MANIFEST_PATH}`);
  console.log(`Artifact sha256: ${manifest.artifact.sha256}`);
  console.log(`Artifact size: ${manifest.artifact.sizeBytes}`);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const name = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[name] = true;
      continue;
    }

    parsed[name] = next;
    index += 1;
  }

  return parsed;
}

function required(value, flag) {
  const text = String(value || '').trim();
  if (!text) fail(`Missing ${flag}.`);
  return text;
}

function normalizeVersion(value) {
  return String(value || '').trim().replace(/^v/i, '');
}

function sanitizeLabel(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40);
}

function normalizeRolloutPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
    fail('--rollout-percent must be between 0 and 100.');
  }
  return Math.round(numeric);
}

function parseBoolean(value) {
  if (value === true) return true;
  const text = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'critical'].includes(text);
}

function isSemver(value) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(value || ''));
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function fail(message) {
  console.error(message);
  console.error('');
  printUsage();
  process.exit(1);
}

function printUsage() {
  console.log([
    'Usage:',
    '  npm run release:publish-manifest -- \\',
    '    --version 1.0.5 \\',
    '    --artifact /path/to/Sidestream-1.0.5-Mac-Installer.dmg \\',
    '    --artifact-url https://9kfjhekmxi6iiwni.private.blob.vercel-storage.com/sidestream/1.0.5/Sidestream-1.0.5-Mac-Installer.dmg?download=1 \\',
    `    --release-notes-url ${DEFAULT_RELEASE_NOTES_URL} \\`,
    '    --signed --verified --uploaded --smoke-tested',
  ].join('\n'));
}
