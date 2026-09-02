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
    const data = await res.json();
    const paths = Object.keys(data.paths);
    console.log('Available endpoints/RPCs:');
    paths.forEach(p => console.log(p));
  } catch (err) {
    console.error('Error fetching OpenAPI schema:', err.message);
  }
}

run();
