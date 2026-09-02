const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: 'c:\\Users\\bhuva\\Desktop\\Ai quiz challenge\\backend\\.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const matches = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = matches[1];
const host = `db.${projectRef}.supabase.co`;
const port = 6543;
const database = 'postgres';
const user = 'postgres';

const passwords = [
  'MySecretPassword123',
  'your_custom_ai_quiz_secret_hash_here_987654321'
];

async function run() {
  for (const password of passwords) {
    console.log('Testing password:', password);
    const client = new Client({
      host,
      port,
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log('🎉 SUCCESS! Password is correct:', password);
      await client.end();
      return;
    } catch (err) {
      console.log('❌ Failed:', err.message);
    }
  }
}

run();
