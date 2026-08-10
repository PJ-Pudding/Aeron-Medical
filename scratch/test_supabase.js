const SUPABASE_HOST = process.env.SUPABASE_HOST || 'aelmtxmanctdjxiwsent.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const options = {
  hostname: SUPABASE_HOST,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data.substring(0, 300)}`);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.end();
