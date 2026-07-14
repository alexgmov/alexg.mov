#!/usr/bin/env node
"use strict";

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const analyticsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alexg-release-manifest-test-'));
process.env.ANALYTICS_LOG_DIR = analyticsDir;
process.env.ANALYTICS_CONSOLE = '0';

const handler = require('../api/sidestream/releases/latest');

const WINDOWS_DOWNLOAD_URL = 'https://sidestream.tv/api/download?platform=win32-x64';
const WINDOWS_MANIFEST = {
  schemaVersion: 1,
  product: 'sidestream',
  channel: 'stable',
  version: '1.0.13',
  minSupportedVersion: '1.0.0',
  critical: false,
  rolloutPercent: 100,
  publishedAt: '2026-07-14T02:23:21.196Z',
  releaseNotesUrl: WINDOWS_DOWNLOAD_URL,
  artifact: {
    type: 'exe',
    url: WINDOWS_DOWNLOAD_URL,
    sha256: '9ab3a9e2fd84d41d9468be184c85081355fe93ab726a33ed62b9c47a32d443ad',
    sizeBytes: 61653939,
  },
};

process.on('exit', () => {
  fs.rmSync(analyticsDir, { recursive: true, force: true });
});

test('Sidestream legacy release manifest routes Mac locally and Windows canonically', async (t) => {
  await t.test('proxies a Windows 1.0.12 request to the canonical manifest', async () => {
    let requestedUrl = '';
    await withFetch(async (url, options) => {
      requestedUrl = String(url);
      assert.equal(options.method, 'GET');
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal);
      return manifestResponse(WINDOWS_MANIFEST);
    }, async () => {
      const response = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=win32-x64&version=1.0.12',
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.version, '1.0.13');
      assert.equal(response.body.artifact.type, 'exe');
      assert.equal(response.body.artifact.url, WINDOWS_DOWNLOAD_URL);
      assert.equal(response.body.releaseNotesUrl, WINDOWS_DOWNLOAD_URL);
      assert.equal(Object.hasOwn(response.body.artifact, 'pathname'), false);
    });

    assert.equal(
      requestedUrl,
      'https://sidestream.tv/api/releases/latest?channel=stable&platform=win32-x64&version=1.0.12',
    );
  });

  await t.test('keeps Mac and platformless requests on the local Mac manifest', async () => {
    await withFetch(async () => {
      throw new Error('Mac release requests must not call the canonical Windows manifest');
    }, async () => {
      const mac = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=darwin-arm64&version=1.0.8',
      );
      const platformless = await invoke('/api/sidestream/releases/latest?channel=stable');

      assert.equal(mac.statusCode, 200);
      assert.equal(mac.body.artifact.type, 'dmg');
      assert.equal(platformless.statusCode, 200);
      assert.equal(platformless.body.artifact.type, 'dmg');
    });
  });

  await t.test('rejects unsupported platforms without contacting the canonical endpoint', async () => {
    await withFetch(async () => {
      throw new Error('Unsupported platforms must fail before an upstream request');
    }, async () => {
      const response = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=linux-x64&version=1.0.12',
      );
      assert.equal(response.statusCode, 404);
      assert.deepEqual(response.body, { error: 'Platform release not found' });
    });
  });

  await t.test('fails closed when the canonical manifest is unavailable', async () => {
    await withFetch(async () => manifestResponse({}, 502), async () => {
      const response = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=win32-x64&version=1.0.12',
      );
      assert.equal(response.statusCode, 503);
      assert.deepEqual(response.body, { error: 'Release manifest is not available' });
    });
  });

  await t.test('fails closed when Windows URLs do not select the Windows artifact', async () => {
    const invalidManifest = {
      ...WINDOWS_MANIFEST,
      releaseNotesUrl: 'https://sidestream.tv/',
      artifact: {
        ...WINDOWS_MANIFEST.artifact,
        url: 'https://sidestream.tv/api/download',
      },
    };

    await withFetch(async () => manifestResponse(invalidManifest), async () => {
      const response = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=win32-x64&version=1.0.12',
      );
      assert.equal(response.statusCode, 503);
      assert.deepEqual(response.body, { error: 'Release manifest is not available' });
    });
  });

  await t.test('validates Windows HEAD requests but returns no body', async () => {
    await withFetch(async () => manifestResponse(WINDOWS_MANIFEST), async () => {
      const response = await invoke(
        '/api/sidestream/releases/latest?channel=stable&platform=win32-x64&version=1.0.12',
        'HEAD',
      );
      assert.equal(response.statusCode, 200);
      assert.equal(response.body, undefined);
    });
  });
});

async function withFetch(fetchImpl, callback) {
  const previous = global.fetch;
  global.fetch = fetchImpl;
  try {
    return await callback();
  } finally {
    global.fetch = previous;
  }
}

function manifestResponse(payload, status = 200) {
  const body = JSON.stringify(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return String(name).toLowerCase() === 'content-length'
          ? String(Buffer.byteLength(body, 'utf8'))
          : null;
      },
    },
    async text() {
      return body;
    },
  };
}

async function invoke(url, method = 'GET') {
  const response = createResponse();
  await handler({ method, url, headers: {}, socket: {} }, response);
  return response;
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end(payload) {
      if (payload !== undefined) this.body = payload;
      return this;
    },
  };
}
