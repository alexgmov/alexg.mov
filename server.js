const fs = require('fs');
const http = require('http');
const path = require('path');
const { trackGetRequest } = require('./lib/analytics-store');

const root = __dirname;
const distRoot = path.join(root, 'dist');
const port = parseInt(process.env.PORT || '3000', 10);
const useViteDev = process.env.NODE_ENV !== 'production';

loadEnv(path.join(root, '.env.local'));

const apiRoutes = {
  '/api/analytics': './api/analytics',
  '/api/analytics-dashboard-data': './api/analytics-dashboard-data',
  '/api/analytics-report': './api/analytics-report',
  '/api/checkout-session': './api/checkout-session',
  '/api/create-checkout': './api/create-checkout',
  '/api/download': './api/download',
  '/api/email-capture': './api/email-capture',
  '/api/webhook': './api/webhook',
  '/analytics': './api/analytics-dashboard',
  '/analytics/': './api/analytics-dashboard',
  '/analytics.': './api/analytics-redirect',
  '/analytics./': './api/analytics-redirect',
  '/analytics-dashboard': './api/analytics-dashboard',
  '/analytics-dashboard/': './api/analytics-dashboard',
};

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.cube': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.zip': 'application/zip',
};

start().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

async function start() {
  const vite = useViteDev ? await createViteMiddleware() : null;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);
    trackGetRequest(req, res, url);
    const route = apiRoutes[url.pathname];

    if (route) {
      attachResponseHelpers(res);
      try {
        const resolved = require.resolve(route);
        delete require.cache[resolved];
        await require(resolved)(req, res);
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Local API error' });
        } else {
          res.end();
        }
      }
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'API route not found' }));
      return;
    }

    if (vite) {
      vite.middlewares(req, res, err => {
        if (err) {
          vite.ssrFixStacktrace(err);
          console.error(err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Vite dev server error');
          }
          return;
        }

        serveStatic(req, url.pathname, res, root, false);
      });
      return;
    }

    serveStatic(req, url.pathname, res, distRoot, true);
  });

  server.listen(port, () => {
    const mode = vite ? 'dev' : 'production';
    console.log(`alexg.mov ${mode} server running at http://localhost:${port}`);
  });
}

async function createViteMiddleware() {
  const { createServer } = await import('vite');
  return createServer({
    root,
    server: {
      middlewareMode: true,
      hmr: {
        port: parseInt(process.env.VITE_HMR_PORT || String(port + 10000), 10),
      },
    },
    appType: 'spa',
  });
}

function attachResponseHelpers(res) {
  res.status = code => {
    res.statusCode = code;
    return res;
  };

  res.json = data => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(data));
  };

  res.send = data => {
    if (!res.headersSent && typeof data === 'string') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    res.end(data);
  };
}

function serveStatic(req, pathname, res, baseRoot, spaFallback) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Method not allowed');
    return;
  }

  let requestPath;
  try {
    requestPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Bad request');
    return;
  }

  if (requestPath.startsWith('/videos/obsolete/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  const filePath = path.normalize(path.join(baseRoot, requestPath));

  if (!isInside(filePath, baseRoot)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (spaFallback && !path.extname(requestPath)) {
        serveSpaFallback(res, baseRoot);
        return;
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }

    serveFile(req, res, filePath, stats);
  });
}

function serveFile(req, res, filePath, stats) {
  const headers = getStaticHeaders(filePath, stats);
  if (isFresh(req, headers, stats)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  const range = req.headers.range;
  if (range) {
    const parsed = parseRange(range, stats.size);
    if (!parsed) {
      res.writeHead(416, {
        ...headers,
        'Content-Range': `bytes */${stats.size}`,
        'Content-Length': 0,
      });
      res.end();
      return;
    }

    const { start, end } = parsed;
    res.writeHead(206, {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Content-Length': end - start + 1,
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    streamFile(filePath, res, { start, end });
    return;
  }

  res.writeHead(200, {
    ...headers,
    'Content-Length': stats.size,
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  streamFile(filePath, res);
}

function getStaticHeaders(filePath, stats) {
  const ext = path.extname(filePath);
  return {
    'Accept-Ranges': 'bytes',
    'Cache-Control': getCacheControl(filePath),
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    ETag: getEtag(stats),
    'Last-Modified': stats.mtime.toUTCString(),
  };
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.html') return 'no-cache';
  if (filePath.includes(`${path.sep}assets${path.sep}`)) return 'public, max-age=31536000, immutable';
  if (['.jpg', '.mp4', '.png', '.webp'].includes(ext)) return 'public, max-age=604800, stale-while-revalidate=604800';
  return 'public, max-age=3600';
}

function getEtag(stats) {
  return `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
}

function isFresh(req, headers, stats) {
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch && (ifNoneMatch === '*' || ifNoneMatch.split(/\s*,\s*/).includes(headers.ETag))) {
    return true;
  }

  const ifModifiedSince = req.headers['if-modified-since'];
  if (!ifModifiedSince) return false;
  const modifiedSince = Date.parse(ifModifiedSince);
  return Number.isFinite(modifiedSince) && stats.mtimeMs <= modifiedSince + 1000;
}

function parseRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;

  let start;
  let end;
  if (match[1] === '') {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return null;
  }

  return {
    start,
    end: Math.min(end, size - 1),
  };
}

function streamFile(filePath, res, options) {
  const stream = fs.createReadStream(filePath, options);
  stream.on('error', err => {
    console.error(err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    res.end();
  });
  stream.pipe(res);
}

function serveSpaFallback(res, baseRoot) {
  const indexPath = path.join(baseRoot, 'index.html');

  fs.readFile(indexPath, (err, data) => {
    if (err) {
      console.error(err);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Build output not found. Run npm run build first.');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes['.html']);
    res.setHeader('Content-Length', data.length);
    res.end(data);
  });
}

function isInside(filePath, baseRoot) {
  const relative = path.relative(baseRoot, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key || process.env[key] != null) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
