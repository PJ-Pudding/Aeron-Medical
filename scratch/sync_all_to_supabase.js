const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_HOST = process.env.SUPABASE_HOST || 'aelmtxmanctdjxiwsent.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const DB_DIR = path.join(__dirname, '..', 'db');

function upsertToSupabase(tableName, jsonData) {
  return new Promise((resolve, reject) => {
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
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          resolve({ success: false, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function syncAll() {
  console.log('🚀 Starting Cloud Database Sync for AERON MEDICAL...');
  const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON database files to sync.\n`);

  let successCount = 0;
  for (const file of files) {
    const tableName = file.replace('.json', '');
    const filePath = path.join(DB_DIR, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
      const jsonData = JSON.parse(content);
      const res = await upsertToSupabase(tableName, jsonData);
      if (res.success) {
        console.log(`✅ Synced: ${tableName} (${Buffer.byteLength(content)} bytes)`);
        successCount++;
      } else {
        console.error(`❌ Failed: ${tableName} (Status ${res.status}): ${res.error}`);
      }
    } catch (err) {
      console.error(`⚠️ Error reading ${file}:`, err.message);
    }
  }
  console.log(`\n🎉 Sync Completed: ${successCount}/${files.length} tables synced!`);
}

syncAll();
