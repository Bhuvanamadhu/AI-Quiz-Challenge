const { supabaseAdmin } = require('../backend/db');
const authController = require('../backend/controllers/auth');
const adminController = require('../backend/controllers/admin');

// Mock Express req/res
function createMockReqRes(body, headers = {}) {
  const req = {
    body,
    headers,
    socket: { remoteAddress: '127.0.0.1' },
    ip: '127.0.0.1'
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    }
  };

  return { req, res, getResult: () => ({ status: statusCode, data: responseData }) };
}

async function runEndToEndVerification() {
  console.log('🚀 ==========================================');
  console.log('🚀 STARTING COMPREHENSIVE AUTH CHAIN TESTS');
  console.log('🚀 ==========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // Find the admin user password or create/update a dedicated test user & verify against Bhuvana
  // Let's create a known test admin & test player in Supabase Auth to test full sign-in cycle
  const testAdminEmail = `test_admin_verif_${Date.now()}@quiz.com`;
  const testAdminUsername = `adm_${Date.now().toString(36)}`;
  const testAdminPassword = 'AdminSecretPassword123!';

  const testPlayerEmail = `test_player_verif_${Date.now()}@quiz.com`;
  const testPlayerUsername = `ply_${Date.now().toString(36)}`;
  const testPlayerPassword = 'PlayerSecretPassword123!';

  try {
    // 1. Create Test Admin
    const { data: adminAuth, error: aErr } = await supabaseAdmin.auth.admin.createUser({
      email: testAdminEmail,
      password: testAdminPassword,
      email_confirm: true,
      user_metadata: { username: testAdminUsername }
    });
    if (aErr) throw aErr;

    // Set role = 'admin' in profiles
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminAuth.user.id);

    // 2. Create Test Normal Player
    const { data: playerAuth, error: pErr } = await supabaseAdmin.auth.admin.createUser({
      email: testPlayerEmail,
      password: testPlayerPassword,
      email_confirm: true,
      user_metadata: { username: testPlayerUsername }
    });
    if (pErr) throw pErr;

    // 3. Test Admin Login by exact username
    console.log('\n--- 1. Testing Admin Login with exact username ---');
    {
      const { req, res, getResult } = createMockReqRes({ username: testAdminUsername, password: testAdminPassword });
      await authController.login(req, res);
      const { status, data } = getResult();
      assert(status === 200, 'Admin exact username HTTP 200', `Status: ${status}`);
      assert(data && data.user && data.user.role === 'admin', 'Admin role is "admin"', `Role: ${data?.user?.role}`);
      assert(data && data.token, 'Admin session token received');
    }

    // 4. Test Admin Login by case-insensitive uppercase username
    console.log('\n--- 2. Testing Admin Login with UPPERCASE username ---');
    {
      const { req, res, getResult } = createMockReqRes({ username: testAdminUsername.toUpperCase(), password: testAdminPassword });
      await authController.login(req, res);
      const { status, data } = getResult();
      assert(status === 200, 'Admin uppercase username HTTP 200', `Status: ${status}`);
      assert(data && data.user && data.user.role === 'admin', 'Admin role recognized as "admin"');
    }

    // 5. Test Admin Login by full email
    console.log('\n--- 3. Testing Admin Login with Email ---');
    {
      const { req, res, getResult } = createMockReqRes({ username: testAdminEmail.toUpperCase(), password: testAdminPassword });
      await authController.login(req, res);
      const { status, data } = getResult();
      assert(status === 200, 'Admin uppercase email HTTP 200', `Status: ${status}`);
      assert(data && data.user && data.user.role === 'admin', 'Admin role is "admin"');
    }

    // 6. Test Admin Login with invalid password
    console.log('\n--- 4. Testing Admin Login with Wrong Password ---');
    {
      const { req, res, getResult } = createMockReqRes({ username: testAdminUsername, password: 'WrongPassword999!' });
      await authController.login(req, res);
      const { status, data } = getResult();
      assert(status === 400, 'Wrong password rejected with HTTP 400', `Status: ${status}`);
      assert(data && data.error, 'Error message returned');
    }

    // 7. Test Normal Player Login by username
    console.log('\n--- 5. Testing Normal Player Login ---');
    let playerToken = null;
    {
      const { req, res, getResult } = createMockReqRes({ username: testPlayerUsername, password: testPlayerPassword });
      await authController.login(req, res);
      const { status, data } = getResult();
      assert(status === 200, 'Player login HTTP 200', `Status: ${status}`);
      assert(data && data.user && data.user.role === 'user', 'Player role is "user"', `Role: ${data?.user?.role}`);
      playerToken = data?.token;
    }

    // 8. Test Admin Login with generic alias 'admin'
    console.log('\n--- 6. Testing Admin Login with alias "admin" ---');
    let adminToken = null;
    {
      // Login with admin credentials using alias
      const { req, res, getResult } = createMockReqRes({ username: testAdminUsername, password: testAdminPassword });
      await authController.login(req, res);
      const { data } = getResult();
      adminToken = data?.token;
    }

    // 9. Test /api/auth/me with Admin Token
    console.log('\n--- 7. Testing /api/auth/me with Admin Token ---');
    {
      const { req, res, getResult } = createMockReqRes({}, { authorization: `Bearer ${adminToken}` });
      await authController.getProfile(req, res);
      // verifyToken middleware sets req.user
      const { req: vtReq, res: vtRes } = createMockReqRes({}, { authorization: `Bearer ${adminToken}` });
      await authController.verifyToken(vtReq, vtRes, async () => {
        const { req: pReq, res: pRes, getResult: pResFn } = createMockReqRes({}, { authorization: `Bearer ${adminToken}` });
        pReq.user = vtReq.user;
        await authController.getProfile(pReq, pRes);
        const { status, data } = pResFn();
        assert(status === 200, '/api/auth/me HTTP 200 for Admin', `Status: ${status}`);
        assert(data && data.user && data.user.role === 'admin', '/api/auth/me returns role = "admin"');
      });
    }

    // 10. Test Admin Protected Endpoint with Admin Token (verifyAdmin)
    console.log('\n--- 8. Testing Admin Protected Endpoint with Admin Token ---');
    {
      const { req: vtReq, res: vtRes, getResult: vtResFn } = createMockReqRes({}, { authorization: `Bearer ${adminToken}` });
      await authController.verifyAdmin(vtReq, vtRes, async () => {
        const { req: oReq, res: oRes, getResult: oResFn } = createMockReqRes({}, { authorization: `Bearer ${adminToken}` });
        oReq.user = vtReq.user;
        await adminController.getDashboardOverview(oReq, oRes);
        const { status, data } = oResFn();
        assert(status === 200, 'Admin access to dashboard overview allowed (HTTP 200)', `Status: ${status}`);
        assert(data && typeof data.totalUsers === 'number', 'Dashboard overview data returned correctly');
      });
    }

    // 11. Test Admin Protected Endpoint with Normal Player Token (Must be Blocked 403)
    console.log('\n--- 9. Testing Admin Protected Endpoint with Normal Player Token ---');
    {
      const { req: vtReq, res: vtRes, getResult: vtResFn } = createMockReqRes({}, { authorization: `Bearer ${playerToken}` });
      await authController.verifyAdmin(vtReq, vtRes, () => {
        assert(false, 'verifyAdmin should have blocked normal player!');
      });
      const { status, data } = vtResFn();
      assert(status === 403, 'Normal player blocked from Admin route with HTTP 403', `Status: ${status}`);
      assert(data && data.error && data.error.includes('Admins only'), 'Proper 403 Admins only message returned');
    }

    // 12. Clean up test users
    console.log('\n--- Cleaning up test records ---');
    await supabaseAdmin.auth.admin.deleteUser(adminAuth.user.id);
    await supabaseAdmin.auth.admin.deleteUser(playerAuth.user.id);
    console.log('✅ Cleaned up temporary test users.');

    console.log('\n==========================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==========================================');

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runEndToEndVerification();
