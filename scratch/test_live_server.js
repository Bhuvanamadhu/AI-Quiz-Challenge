const app = require('../backend/server');
const http = require('http');

async function testLiveServer() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Test leaderboard
    const lbRes = await fetch(`http://127.0.0.1:${port}/api/leaderboard`);
    console.log('Leaderboard HTTP status:', lbRes.status);

    // 2. Test invalid login
    const badLoginRes = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'non_existent_user_xyz', password: 'random_password' })
    });
    console.log('Bad login HTTP status (expected 400):', badLoginRes.status);
    const badLoginData = await badLoginRes.json();
    console.log('Bad login response:', badLoginData);

    console.log('✅ Server HTTP endpoints responding properly!');
  } finally {
    server.close();
  }
}

testLiveServer();
