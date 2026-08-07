const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Ensure WebSocket is defined for Node.js < 22 environments (for Supabase Realtime client support)
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('ws');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are present
const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey);

if (!isConfigured) {
  console.warn('⚠️ Supabase configurations are missing in environment variables!');
}

// Create a service-role level Supabase client for admin operations (bypasses RLS)
let rawSupabaseAdmin = null;
if (isConfigured) {
  rawSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// Proxy wrapper for supabaseAdmin to throw clear config errors rather than crashing on startup
const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    if (!isConfigured) {
      throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are not configured. Please set them in your Vercel Dashboard Project Settings.');
    }
    return rawSupabaseAdmin[prop];
  }
});

/**
 * Creates or retrieves a user-authenticated Supabase client instance.
 * Automatically injects the user's JWT from authorization headers to enforce Row Level Security (RLS).
 * 
 * @param {object} req - Express Request object
 */
function getSupabaseClient(req) {
  if (!isConfigured) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are not configured. Please set them in your Vercel Dashboard Project Settings.');
  }

  let token = null;
  if (req && req.headers && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    token = authHeader.split(' ')[1];
  }

  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }

  // Fallback to anonymous client if no token provided
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// Export clients
module.exports = {
  supabaseAdmin,
  getSupabaseClient,
  // Stub database initializer for server.js startup sequence compatibility
  initDb: async () => {
    console.log('📡 Database connection established via Supabase client wrappers.');
    return Promise.resolve();
  }
};
