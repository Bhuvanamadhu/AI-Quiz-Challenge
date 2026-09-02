const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is missing in backend/.env');
  process.exit(1);
}

// Extract project reference ID from Supabase URL
// URL format: https://<ref>.supabase.co
const matches = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!matches) {
  console.error('❌ Could not parse project reference from SUPABASE_URL:', supabaseUrl);
  process.exit(1);
}

const projectRef = matches[1];
const host = `db.${projectRef}.supabase.co`;
const port = 5432;
const database = 'postgres';
const user = 'postgres';

// Get database password from command line arguments
const password = process.argv[2];

if (!password) {
  console.log('\n========================================================================');
  console.log('🔧 SUPABASE SCHEMAS MIGRATION TOOL');
  console.log('========================================================================');
  console.log(`Host: ${host}`);
  console.log(`Database: ${database}`);
  console.log(`User: ${user}`);
  console.log('\n⚠️  Please provide your database password as a command line argument.');
  console.log('👉 Example: node scripts/run_migration.js MySecretPassword123');
  console.log('========================================================================\n');
  process.exit(1);
}

const client = new Client({
  host,
  port,
  database,
  user,
  password,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrationSql = fs.readFileSync(path.join(__dirname, 'migration_add_timing_fields.sql'), 'utf8');

async function run() {
  console.log(`🔌 Connecting to Supabase database ${host}...`);
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('⚡ Running migration SQL statements...');
    await client.query(migrationSql);
    console.log('🎉 Database migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
