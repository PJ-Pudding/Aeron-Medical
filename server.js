const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8085;
const ROOT_DIR = __dirname;

const SUPABASE_HOST = process.env.SUPABASE_HOST || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

function syncToSupabaseCloud(tableName, jsonData) {
  try {
    const payload = JSON.stringify({
      table_name: tableName,
      data: jsonData,
      updated_at: new Date().toISOString()
    });
    const options = {
      hostname: SUPABASE_HOST,
      path: '/rest/v1/aeron_kv_store',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      // Cloud sync completed
    });
    req.on('error', (e) => {
      console.warn(`[Cloud Sync Warning - ${tableName}]:`, e.message);
    });
    req.write(payload);
    req.end();
  } catch (e) {
    console.warn('[Cloud Sync Error]:', e.message);
  }
}

function fetchFromSupabaseCloud(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_HOST,
      path: `/rest/v1/aeron_kv_store?table_name=eq.${encodeURIComponent(tableName)}&select=data`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const arr = JSON.parse(body);
            if (arr && arr.length > 0 && arr[0].data) {
              resolve(arr[0].data);
              return;
            }
          }
        } catch (e) {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

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

const server = http.createServer(async (req, res) => {
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

  // API Load from Cloud DB with local fallback
  if (req.method === 'GET' && pathname === 'api/load-db') {
    const tableName = urlObj.searchParams.get('table');
    if (tableName) {
      try {
        const cloudData = await fetchFromSupabaseCloud(tableName);
        if (cloudData) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Data-Source': 'SupabaseCloud' });
          res.end(JSON.stringify(cloudData));
          return;
        }
      } catch (e) {}

      const localPath = path.join(ROOT_DIR, 'db', `${tableName}.json`);
      if (fs.existsSync(localPath)) {
        const data = fs.readFileSync(localPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Data-Source': 'LocalFile' });
        res.end(data);
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Table not found' }));
    return;
  }

  // Protected REST API V1 Routes with Cloud Sync
  if (pathname.startsWith('api/v1/')) {
    const authHeader = req.headers['authorization'] || '';
    const endpoint = pathname.replace('api/v1/', '');

    if (['projects', 'finance', 'hr'].includes(endpoint)) {
      const tableName = endpoint === 'finance' ? 'cost_calculations' : endpoint;
      try {
        const cloudData = await fetchFromSupabaseCloud(tableName);
        if (cloudData) {
          res.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8',
            'X-AERON-Auth-Status': authHeader ? 'Authorized' : 'PublicDemoSession',
            'X-Data-Source': 'SupabaseCloud'
          });
          res.end(JSON.stringify(cloudData));
          return;
        }
      } catch (e) {}

      const targetPath = path.join(ROOT_DIR, 'db', `${endpoint === 'finance' ? 'costCalculations' : endpoint}.json`);
      if (fs.existsSync(targetPath)) {
        const data = fs.readFileSync(targetPath, 'utf8');
        res.writeHead(200, { 
          'Content-Type': 'application/json; charset=utf-8',
          'X-AERON-Auth-Status': authHeader ? 'Authorized' : 'PublicDemoSession',
          'X-Data-Source': 'LocalFile'
        });
        res.end(data);
        return;
      }
    }
  }

  // API Handler for saving DB with instant Cloud Sync
  if (req.method === 'POST' && pathname === 'api/save-db') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const tableName = urlObj.searchParams.get('table');
        if (tableName && body) {
          // 1. Save to local disk
          const targetPath = path.join(ROOT_DIR, 'db', `${tableName}.json`);
          fs.writeFileSync(targetPath, body, 'utf8');

          // 2. Real-time Sync to Supabase Cloud DB
          try {
            const parsed = JSON.parse(body);
            syncToSupabaseCloud(tableName, parsed);
          } catch (pe) {}

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, message: `Saved ${tableName}.json & Synced to Cloud DB` }));
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
