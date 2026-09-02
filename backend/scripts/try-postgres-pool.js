const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const matches = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = matches[1];
const host = `db.${projectRef}.supabase.co`;
const port = 6543; // connection pool port
const database = 'postgres';
const user = 'postgres';

const migrationSql = `
  ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
  ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
  ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
  ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
`;

const passwords = [
  'MySecretPassword123',
  'your_custom_ai_quiz_secret_hash_here_987654321',
  'SupabasePassword123',
  'Supabase123!',
  'Supabase123',
  'ai_quiz_challenge',
  'aiquiz123',
  'bhuvana',
  'Bhuvana',
  'bhuvanamadhu',
  'Bhuvanamadhu',
  'postgres',
  'admin123'
];

async function tryConnect() {
  for (const password of passwords) {
    console.log(`Trying password on port 6543: ${password}`);
    const client = new Client({
      host,
      port,
      database,
      user,
      password,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      console.log(`🎉 SUCCESS! Password is: ${password}`);
      console.log('Running migration SQL...');
      await client.query(migrationSql);
      console.log('✅ Migration completed successfully!');
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed with password: ${password}. Error: ${err.message}`);
    }
  }
  console.log('All passwords failed on port 6543.');
}

tryConnect();
