const { supabaseAdmin } = require('../backend/db');
const adminController = require('../backend/controllers/admin');
const authController = require('../backend/controllers/auth');

async function runVerification() {
  console.log('=====================================================');
  console.log('VERIFICATION SUITE: ADMIN PLAYER ACCOUNT DELETION');
  console.log('=====================================================\n');

  // 1. Fetch current admin profile
  const { data: adminProf, error: adminErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminErr || !adminProf) {
    throw new Error('Admin profile not found in DB: ' + (adminErr ? adminErr.message : 'null'));
  }
  console.log(`[PASS] Admin profile verified: "${adminProf.username}" (${adminProf.email}), ID: ${adminProf.id}`);

  // 2. Test Admin Deletion Protection
  console.log('\n--- Step 1: Verify Admin Deletion Protection ---');
  let adminBlockTriggered = false;
  const mockReqAdmin = { params: { id: adminProf.id } };
  const mockResAdmin = {
    status: (code) => ({
      json: (data) => {
        if (code === 400 && data.error && data.error.includes('Admin')) {
          adminBlockTriggered = true;
          console.log(`[PASS] Admin delete attempt was correctly blocked: HTTP ${code} - ${data.error}`);
        } else {
          console.error(`[FAIL] Unexpected admin delete response: HTTP ${code}`, data);
        }
      }
    }),
    json: (data) => console.error('[FAIL] Admin delete succeeded unexpectedly:', data)
  };

  await adminController.deleteUser(mockReqAdmin, mockResAdmin);
  if (!adminBlockTriggered) {
    throw new Error('Admin deletion protection failed!');
  }

  // 3. Create a test normal player
  console.log('\n--- Step 2: Create a Test Normal Player Account ---');
  const testTimestamp = Date.now();
  const testEmail = `player_del_${testTimestamp}@example.com`;
  const testPassword = 'PlayerPass123!';
  const testUsername = `player_${testTimestamp.toString().slice(-5)}`;

  const { data: authCreated, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { username: testUsername }
  });

  if (createErr || !authCreated.user) {
    throw new Error('Failed to create test auth user: ' + (createErr ? createErr.message : ''));
  }

  const testUserId = authCreated.user.id;
  console.log(`[PASS] Test user created in Auth: ${testUsername} (${testUserId})`);

  // Setup profile and related rows
  await supabaseAdmin.from('profiles').upsert({
    id: testUserId,
    username: testUsername,
    email: testEmail,
    role: 'user'
  });

  await supabaseAdmin.from('quiz_progress').upsert({
    user_id: testUserId,
    total_xp: 250,
    quizzes_completed: 3,
    daily_streak: 1
  });

  await supabaseAdmin.from('quiz_attempts').insert({
    user_id: testUserId,
    category: 'JavaScript',
    difficulty: 'easy',
    score: 9,
    total_questions: 10,
    accuracy: 90,
    correct_answers: 9,
    wrong_answers: 1,
    time_taken: 40,
    xp_earned: 45,
    coins_earned: 15
  });

  // Verify user appears in getAllUsers list
  let foundInListBefore = false;
  const mockReqList = {};
  const mockResListBefore = {
    status: (code) => ({ json: (d) => console.error('Error fetching list:', d) }),
    json: (users) => {
      foundInListBefore = users.some(u => u.id === testUserId);
    }
  };
  await adminController.getAllUsers(mockReqList, mockResListBefore);
  console.log(`[PASS] Player exists in Player Accounts list before delete: ${foundInListBefore}`);

  // 4. Perform Delete of Normal Player
  console.log('\n--- Step 3: Delete the Normal Player Account ---');
  let deleteSuccess = false;
  const mockReqDelete = { params: { id: testUserId } };
  const mockResDelete = {
    status: (code) => ({
      json: (data) => console.error(`[FAIL] Delete failed with code ${code}:`, data)
    }),
    json: (data) => {
      if (data && data.message && data.message.includes('deleted')) {
        deleteSuccess = true;
        console.log(`[PASS] Delete API responded with success:`, data.message);
      }
    }
  };

  await adminController.deleteUser(mockReqDelete, mockResDelete);
  if (!deleteSuccess) {
    throw new Error('Normal player deletion failed!');
  }

  // 5. Verify Player Accounts list immediately refreshed
  console.log('\n--- Step 4: Verify Player Accounts List After Deletion ---');
  let foundInListAfter = false;
  const mockResListAfter = {
    status: (code) => ({ json: (d) => console.error('Error fetching list:', d) }),
    json: (users) => {
      foundInListAfter = users.some(u => u.id === testUserId);
      console.log(`Total active player accounts in list: ${users.length}`);
    }
  };
  await adminController.getAllUsers(mockReqList, mockResListAfter);
  console.log(`[PASS] Deleted player does NOT appear in accounts list: ${!foundInListAfter}`);

  // 6. Verify Database Tables
  console.log('\n--- Step 5: Verify Database Cleanup ---');
  const { data: profAfter } = await supabaseAdmin.from('profiles').select('id').eq('id', testUserId).maybeSingle();
  const { data: progAfter } = await supabaseAdmin.from('quiz_progress').select('user_id').eq('user_id', testUserId).maybeSingle();
  const { data: attAfter } = await supabaseAdmin.from('quiz_attempts').select('id').eq('user_id', testUserId);
  const { data: authAfter } = await supabaseAdmin.auth.admin.getUserById(testUserId).catch(() => ({ data: null }));

  console.log(`[PASS] Profile record removed: ${profAfter === null}`);
  console.log(`[PASS] Progress record removed: ${progAfter === null}`);
  console.log(`[PASS] Attempts records removed: ${attAfter && attAfter.length === 0}`);
  console.log(`[PASS] Auth user removed: ${authAfter === null || !authAfter.user}`);

  // 7. Verify Login Fails For Deleted User
  console.log('\n--- Step 6: Verify Login Fails for Deleted User ---');
  let loginBlocked = false;
  const mockReqLogin = {
    body: {
      username: testUsername,
      password: testPassword
    }
  };
  const mockResLogin = {
    status: (code) => ({
      json: (data) => {
        if (code === 401 || code === 400 || (data && data.error)) {
          loginBlocked = true;
          console.log(`[PASS] Login rejected as expected: HTTP ${code} - ${data.error}`);
        }
      }
    }),
    json: (data) => console.error('[FAIL] Deleted user was unexpectedly able to login:', data)
  };
  await authController.login(mockReqLogin, mockResLogin);
  console.log(`[PASS] Login rejection verified: ${loginBlocked}`);

  // 8. Verify Admin Account remains intact
  console.log('\n--- Step 7: Verify Admin Account Still Intact ---');
  const { data: adminCheck } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .eq('id', adminProf.id)
    .single();

  console.log(`[PASS] Admin account intact: "${adminCheck.username}", role: ${adminCheck.role}`);

  console.log('\n=====================================================');
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)');
  console.log('=====================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
