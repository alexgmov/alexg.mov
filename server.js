const fs = require('fs');
const http = require('http');
const path = require('path');

const root = __dirname;
const port = parseInt(process.env.PORT || '3000', 10);

loadEnv(path.join(root, '.env.local'));

const apiRoutes = {
  '/api/checkout-session': './api/checkout-session',
  '/api/create-checkout': './api/create-checkout',
  '/api/download': './api/download',
  '/api/webhook': './api/webhook',
};

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.cube': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);
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

  serveStatic(url.pathname, res);
});

server.listen(port, () => {
  console.log(`alexg.mov dev server running at http://localhost:${port}`);
});

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

function serveStatic(pathname, res) {
  const requestPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(root, requestPath));

  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    res.end(data);
  });
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
