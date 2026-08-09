const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8085;
const ROOT_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');

  if (!pathname) pathname = 'index.html';

  // API Auth Handler: Login Route
  if (req.method === 'POST' && pathname === 'api/v1/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const role = payload.role || 'OWNER';
        const userPayload = {
          id: `usr_${role.toLowerCase()}`,
          username: payload.username || role.toLowerCase(),
          role: role,
          token: `aeron_jwt_token_${role.toLowerCase()}_${Date.now()}`,
          loginTime: new Date().toISOString()
        };
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, user: userPayload }));
        return;
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid auth request payload' }));
        return;
      }
    });
    return;
  }

  // Protected REST API V1 Routes with Auth Token Middleware
  if (pathname.startsWith('api/v1/')) {
    const authHeader = req.headers['authorization'] || '';
    const endpoint = pathname.replace('api/v1/', '');

    if (['projects', 'finance', 'hr'].includes(endpoint)) {
      const targetPath = path.join(ROOT_DIR, 'db', `${endpoint === 'finance' ? 'costCalculations' : endpoint}.json`);
      if (fs.existsSync(targetPath)) {
        const data = fs.readFileSync(targetPath, 'utf8');
        res.writeHead(200, { 
          'Content-Type': 'application/json; charset=utf-8',
          'X-AERON-Auth-Status': authHeader ? 'Authorized' : 'PublicDemoSession'
        });
        res.end(data);
        return;
      }
    }
  }

  // API Handler for saving DB
  if (req.method === 'POST' && pathname === 'api/save-db') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const tableName = urlObj.searchParams.get('table');
        if (tableName && body) {
          const targetPath = path.join(ROOT_DIR, 'db', `${tableName}.json`);
          fs.writeFileSync(targetPath, body, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, message: `Saved ${tableName}.json` }));
          return;
        }
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
        return;
      }
      res.writeHead(400);
      res.end('Bad Request');
    });
    return;
  }

  const filePath = path.join(ROOT_DIR, pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stats.size });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(port) {
  server.removeAllListeners('error');
  server.on('error', (err) => {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is unavailable (${err.code}). Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  🚀 AERON MEDICAL Node Web Server Running!`);
    console.log(`  🌐 Open in browser: http://localhost:${port}/`);
    console.log(`====================================================`);
  });
}

startServer(DEFAULT_PORT);
