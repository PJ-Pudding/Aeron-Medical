const SUPABASE_HOST = process.env.SUPABASE_HOST || 'aelmtxmanctdjxiwsent.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query: sql });
    const options = {
      hostname: SUPABASE_HOST,
      path: '/pg/query',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function test() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.aeron_kv_store (
      table_name TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  const res = await runSql(sql);
  console.log('SQL Response:', res);
}

test();
