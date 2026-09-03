const { supabaseAdmin } = require('../backend/db');
const adminController = require('../backend/controllers/admin');

async function runTest() {
  console.log('=== TEST 1: Admin Protection Check ===');
  // Find admin profile
  const { data: adminProf } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role')
    .eq('role', 'admin')
    .limit(1)
    .single();

  console.log('Found Admin Profile:', adminProf);

  // Mock req/res for deleting admin
  let adminDeleteBlocked = false;
  const mockReqAdmin = { params: { id: adminProf.id } };
  const mockResAdmin = {
    status: (code) => ({
      json: (data) => {
        console.log(`Admin delete response code: ${code}`, data);
        if (code === 400 && data.error && data.error.includes('Admin')) {
          adminDeleteBlocked = true;
        }
      }
    }),
    json: (data) => console.log('Admin delete unexpected success:', data)
  };

  await adminController.deleteUser(mockReqAdmin, mockResAdmin);
  console.log('Admin delete blocked properly:', adminDeleteBlocked);

  console.log('\n=== TEST 2: Create and Delete Temporary Normal Player Account ===');
  const tempEmail = `temp_del_test_${Date.now()}@example.com`;
  const tempPass = 'TestPass123!';
  const tempUsername = `temp_user_${Math.floor(Math.random() * 10000)}`;

  // Create user in Supabase Auth
  const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: tempEmail,
    password: tempPass,
    email_confirm: true,
    user_metadata: { username: tempUsername }
  });

  if (authErr) {
    console.error('Failed to create test auth user:', authErr);
    return;
  }

  const userId = authUser.user.id;
  console.log('Created test user with ID:', userId);

  // Ensure profile and data exist
  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    username: tempUsername,
    email: tempEmail,
    role: 'user'
  });

  await supabaseAdmin.from('quiz_progress').upsert({
    user_id: userId,
    total_xp: 150,
    quizzes_completed: 2
  });

  await supabaseAdmin.from('quiz_attempts').insert({
    user_id: userId,
    category: 'AI',
    difficulty: 'easy',
    score: 8,
    total_questions: 10,
    accuracy: 80,
    correct_answers: 8,
    wrong_answers: 2,
    time_taken: 30,
    xp_earned: 40,
    coins_earned: 10
  });

  // Verify created
  const { data: beforeProf } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).maybeSingle();
  console.log('Test user exists in profiles before delete:', !!beforeProf);

  // Call deleteUser
  let userDeleted = false;
  const mockReqUser = { params: { id: userId } };
  const mockResUser = {
    status: (code) => ({
      json: (data) => console.log(`User delete status: ${code}`, data)
    }),
    json: (data) => {
      console.log('User delete response:', data);
      if (data && data.message && data.message.includes('deleted')) {
        userDeleted = true;
      }
    }
  };

  await adminController.deleteUser(mockReqUser, mockResUser);
  console.log('Delete function executed successfully:', userDeleted);

  // Verify deletion from profiles
  const { data: afterProf } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).maybeSingle();
  console.log('Test user in profiles after delete (should be null):', afterProf);

  // Verify deletion from quiz_progress
  const { data: afterProg } = await supabaseAdmin.from('quiz_progress').select('user_id').eq('user_id', userId).maybeSingle();
  console.log('Test user in quiz_progress after delete (should be null):', afterProg);

  // Verify deletion from quiz_attempts
  const { data: afterAttempts } = await supabaseAdmin.from('quiz_attempts').select('id').eq('user_id', userId);
  console.log('Test user attempts after delete (should be empty array):', afterAttempts);

  // Verify auth user deletion
  const { data: afterAuth } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  console.log('Test user in auth after delete (should be null):', afterAuth && afterAuth.user ? afterAuth.user.id : null);

  // Verify admin is still intact
  const { data: checkAdmin } = await supabaseAdmin.from('profiles').select('id, username').eq('id', adminProf.id).single();
  console.log('Admin account intact:', checkAdmin);
}

runTest().catch(console.error);
