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

        serveStatic(url.pathname, res, root, false);
      });
      return;
    }

    serveStatic(url.pathname, res, distRoot, true);
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

function serveStatic(pathname, res, baseRoot, spaFallback) {
  const requestPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(baseRoot, requestPath));

  if (!isInside(filePath, baseRoot)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (spaFallback && !path.extname(requestPath)) {
        serveSpaFallback(res, baseRoot);
        return;
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[path.extname(filePath)] || 'application/octet-stream');
    res.setHeader('Content-Length', data.length);
    res.end(data);
  });
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
