const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('ws');
}
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing in .env!');
  process.exit(1);
}

// Initialize two different user clients to test RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function runTests() {
  console.log('🧪 Starting Supabase integration automated tests...');

  try {
    // Test 1: Fetch public questions
    console.log('Testing public questions fetch...');
    // We sign up/login first since RLS requires authenticated user for questions select
    const testEmail1 = `test_player_1_${Date.now()}@quiz.com`;
    const testPassword = 'TestSecurePassword123';
    const testUsername1 = `test_player_1_${Date.now().toString(36)}`;

    const { supabaseAdmin } = require('../db');
    const { data: signUpData1, error: signUpErr1 } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail1,
      password: testPassword,
      email_confirm: true,
      user_metadata: { username: testUsername1 }
    });

    if (signUpErr1) {
      throw new Error('Signup failed: ' + signUpErr1.message);
    }
    console.log('✅ Test 1: User 1 signed up successfully. UUID:', signUpData1.user.id);

    // Login to get token session
    const { data: logInData1, error: logInErr1 } = await supabase.auth.signInWithPassword({
      email: testEmail1,
      password: testPassword
    });

    if (logInErr1) {
      throw new Error('Login failed: ' + logInErr1.message);
    }
    console.log('✅ Test 2: User 1 logged in successfully.');

    // Create client representing User 1 context
    const userClient1 = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${logInData1.session.access_token}` } }
    });

    // Fetch random questions using RPC
    console.log('Testing random questions retrieval...');
    const { data: questions, error: questionsErr } = await userClient1.rpc('get_random_questions', {
      p_category: 'AI',
      p_difficulty: 'easy',
      p_limit: 5
    });

    if (questionsErr) {
      throw new Error('Questions fetch failed: ' + questionsErr.message);
    }
    console.log('✅ Test 3: Questions RPC successfully retrieved questions count:', questions ? questions.length : 0);

    // Test RLS on private user data
    console.log('Testing Row Level Security (RLS) enforcement...');
    
    // Insert an attempt for User 1
    const { error: insertErr } = await userClient1
      .from('quiz_attempts')
      .insert({
        user_id: signUpData1.user.id,
        category: 'AI',
        difficulty: 'easy',
        score: 4,
        total_questions: 5,
        accuracy: 80,
        correct_answers: 4,
        wrong_answers: 1,
        time_taken: 30,
        xp_earned: 40,
        coins_earned: 40,
        certificate_status: 'Not Claimed'
      });

    if (insertErr) {
      throw new Error('Insert attempt failed: ' + insertErr.message);
    }
    console.log('✅ Test 4: User 1 attempt log inserted.');

    // Create User 2
    const testEmail2 = `test_player_2_${Date.now()}@quiz.com`;
    const testUsername2 = `test_player_2_${Date.now().toString(36)}`;

    const { data: signUpData2, error: signUpErr2 } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail2,
      password: testPassword,
      email_confirm: true,
      user_metadata: { username: testUsername2 }
    });

    if (signUpErr2) {
      throw new Error('User 2 signup failed: ' + signUpErr2.message);
    }
    console.log('User 2 signed up successfully. UUID:', signUpData2.user.id);

    // Login User 2
    const { data: logInData2, error: logInErr2 } = await supabase.auth.signInWithPassword({
      email: testEmail2,
      password: testPassword
    });

    if (logInErr2) {
      throw new Error('User 2 login failed: ' + logInErr2.message);
    }

    const userClient2 = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${logInData2.session.access_token}` } }
    });

    // Test RLS check: User 2 tries to select User 1's attempts
    console.log('Testing RLS separation between User 1 and User 2...');
    const { data: user1AttemptsForUser2, error: readErr } = await userClient2
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', signUpData1.user.id);

    if (readErr) {
      console.log('Received error on cross-read (which is correct):', readErr.message);
    }

    const attemptCount = user1AttemptsForUser2 ? user1AttemptsForUser2.length : 0;
    if (attemptCount === 0) {
      console.log('✅ Test 5: RLS successfully blocked User 2 from reading User 1\'s attempts.');
    } else {
      throw new Error('❌ SECURITY BREAK: User 2 read attempts for User 1!');
    }

    // Clean up test users from Auth
    await supabaseAdmin.auth.admin.deleteUser(signUpData1.user.id);
    await supabaseAdmin.auth.admin.deleteUser(signUpData2.user.id);
    console.log('✅ Test 6: Cleaned up test users from Auth.');

    console.log('🎉 All automated tests completed successfully!');

  } catch (err) {
    console.error('❌ Integration tests failed:', err.message);
    process.exit(1);
  }
}

runTests();
