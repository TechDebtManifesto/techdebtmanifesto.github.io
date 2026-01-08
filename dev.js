const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const build = require('./build');

const ROOT = process.cwd();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);

const MIME_BY_EXT = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function safePathFromUrl(requestUrl) {
  const { pathname } = url.parse(requestUrl);
  const decoded = decodeURIComponent(pathname || '/');
  const normalized = path.posix.normalize(decoded);
  const stripped = normalized.replace(/^(\.\.(\/|\\|$))+/, '');
  return stripped === '/' ? '/index.html' : stripped;
}

function contentTypeFor(filePath) {
  return MIME_BY_EXT[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function rebuild() {
  try {
    await build();
    process.stdout.write(`[build] OK ${new Date().toLocaleTimeString()}\n`);
  } catch (error) {
    process.stderr.write(`[build] FAIL ${new Date().toLocaleTimeString()}\n`);
    process.stderr.write(`${error && error.stack ? error.stack : String(error)}\n`);
  }
}

function watchAndRebuild() {
  const watchedPaths = [path.join(ROOT, 'src'), path.join(ROOT, '_includes')];
  let rebuildTimer = null;

  const schedule = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => void rebuild(), 75);
  };

  for (const watchedPath of watchedPaths) {
    if (!fs.existsSync(watchedPath)) continue;
    fs.watch(watchedPath, { recursive: true }, schedule);
  }
}

async function main() {
  await rebuild();
  watchAndRebuild();

  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 400;
      res.end('Bad Request');
      return;
    }

    const requestPath = safePathFromUrl(req.url);
    const diskPath = path.join(ROOT, requestPath);

    if (!diskPath.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.stat(diskPath, (statErr, stat) => {
      if (statErr || !stat.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not Found');
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', contentTypeFor(diskPath));
      res.setHeader('Cache-Control', 'no-store');
      fs.createReadStream(diskPath).pipe(res);
    });
  });

  server.on('error', (error) => {
    const code = error && error.code;
    if (code === 'EADDRINUSE') {
      process.stderr.write(`Port ${PORT} is already in use. Try: PORT=3001 npm run dev\n`);
      process.exit(1);
    }
    if (code === 'EPERM') {
      process.stderr.write(
        `Unable to bind http://${HOST}:${PORT} (EPERM). If you're running inside a sandboxed environment, port binding may be blocked.\n`
      );
      process.exit(1);
    }
    process.stderr.write(`${error && error.stack ? error.stack : String(error)}\n`);
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    process.stdout.write(`Serving ${ROOT}\n`);
    process.stdout.write(`http://${HOST}:${PORT}\n`);
  });
}

main().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : String(error)}\n`);
  process.exit(1);
});
