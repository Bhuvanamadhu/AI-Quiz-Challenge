const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/`;
  const headers = {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  };

  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', text.substring(0, 1000));
  } catch (err) {
    console.error('Error fetching OpenAPI schema:', err.message);
  }
}

run();
