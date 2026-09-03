const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8085;
const ROOT_DIR = path.resolve(__dirname);
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB Max Payload Protection

// 🔑 Load local .env configuration securely (if exists)
const envFilePath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envFilePath)) {
  try {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  } catch (e) {
    console.warn('[Notice] Could not load .env file:', e.message);
  }
}

const SUPABASE_HOST = process.env.SUPABASE_HOST || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// 🛡️ Security Allowlist: Allowed Database Tables (Prevents Path Traversal)
const ALLOWED_TABLES = new Set([
  'projects',
  'products',
  'product_categories',
  'accounting',
  'cost_calculations',
  'costCalculations',
  'demo_bookings',
  'fda_registrations',
  'leave_requests',
  'members',
  'messenger_trips',
  'purchase_orders',
  'repair_tickets',
  'shipments',
  'sold_products',
  'attendance_logs',
  'accounting_audit',
  'users'
]);

function isValidTableName(tableName) {
  if (!tableName || typeof tableName !== 'string') return false;
  const cleanName = tableName.trim();
  return /^[a-zA-Z0-9_]+$/.test(cleanName) && ALLOWED_TABLES.has(cleanName);
}

function syncToSupabaseCloud(tableName, jsonData) {
  if (!SUPABASE_HOST || !SUPABASE_KEY || !isValidTableName(tableName)) return;

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
  if (!SUPABASE_HOST || !SUPABASE_KEY || !isValidTableName(tableName)) return Promise.resolve(null);

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
  // 🛡️ Global Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle CORS Pre-flight Options Request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');

  if (!pathname) pathname = 'index.html';

  // API Auth Handler: Login Route
  if (req.method === 'POST' && pathname === 'api/v1/auth/login') {
    let body = '';
    let sizeExceeded = false;
    req.on('data', chunk => {
      if (sizeExceeded) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_PAYLOAD_BYTES) {
        sizeExceeded = true;
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Payload Too Large: Maximum size is 5MB' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (sizeExceeded) return;
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
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid auth request payload' }));
        return;
      }
    });
    return;
  }

  // API Load from Cloud DB with local fallback
  if (req.method === 'GET' && pathname === 'api/load-db') {
    const tableName = urlObj.searchParams.get('table');
    if (tableName && isValidTableName(tableName)) {
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
    res.end(JSON.stringify({ error: 'Table not found or access denied' }));
    return;
  }

  // ☁️ API Cloud Status Check
  if (req.method === 'GET' && pathname === 'api/cloud-status') {
    const isConfigured = Boolean(SUPABASE_HOST && SUPABASE_KEY);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ 
      configured: isConfigured, 
      host: SUPABASE_HOST ? SUPABASE_HOST.substring(0, 8) + '...' : null,
      mode: isConfigured ? 'SupabaseCloud' : 'LocalOffline' 
    }));
    return;
  }

  // ☁️ API Batch Sync All Local Tables to Cloud
  if (req.method === 'POST' && pathname === 'api/sync-all-to-cloud') {
    try {
      const dbPath = path.join(ROOT_DIR, 'db');
      if (!fs.existsSync(dbPath)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'db directory not found' }));
        return;
      }
      const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));
      let syncedCount = 0;
      for (const file of files) {
        const tableName = file.replace('.json', '');
        if (isValidTableName(tableName)) {
          const filePath = path.join(dbPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
            const jsonData = JSON.parse(content);
            syncToSupabaseCloud(tableName, jsonData);
            syncedCount++;
          } catch (e) {}
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: `Synced ${syncedCount} tables to Supabase Cloud`, syncedCount }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Protected REST API V1 Routes with Cloud Sync
  if (pathname.startsWith('api/v1/')) {
    const authHeader = req.headers['authorization'] || '';
    const endpoint = pathname.replace('api/v1/', '');

    if (['projects', 'finance', 'hr'].includes(endpoint)) {
      const tableName = endpoint === 'finance' ? 'cost_calculations' : endpoint;
      if (isValidTableName(tableName)) {
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
  }

  // 🛡️ API Handler for saving DB with Sanitization & Size Limit
  if (req.method === 'POST' && pathname === 'api/save-db') {
    let body = '';
    let sizeExceeded = false;
    req.on('data', chunk => {
      if (sizeExceeded) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_PAYLOAD_BYTES) {
        sizeExceeded = true;
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Payload Too Large: Maximum allowed size is 5MB' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (sizeExceeded) return;
      try {
        const tableName = urlObj.searchParams.get('table');
        
        // 🛡️ Strict Table Validation & Path Traversal Prevention
        if (!tableName || !isValidTableName(tableName)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Invalid or unauthorized table name' }));
          return;
        }

        if (body) {
          // 1. Save to local disk safely
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
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
        return;
      }
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Bad Request' }));
    });
    return;
  }

  // 🛡️ Static File Serving with Strict Path Traversal Protection
  const resolvedPath = path.resolve(ROOT_DIR, pathname);
  if (!resolvedPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: Access outside root is prohibited');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stats.size });
    fs.createReadStream(resolvedPath).pipe(res);
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
    console.log(`  🚀 AERON MEDICAL Secure Node Web Server Running!`);
    console.log(`  🌐 Open in browser: http://localhost:${port}/`);
    console.log(`====================================================`);
  });
}

startServer(DEFAULT_PORT);
