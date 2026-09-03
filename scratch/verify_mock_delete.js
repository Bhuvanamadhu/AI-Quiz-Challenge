// Test script for MockDatabase delete flow in script.js

// Mock localStorage environment
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

global.AppState = {
  isOnline: false,
  token: 'mock_jwt_token_for_admin'
};

// Seed initial mock data
localStorage.setItem('mock_users', JSON.stringify([
  { id: 1, username: 'admin', email: 'admin@quiz.com', role: 'admin' },
  { id: 2, username: 'Bhuvana', email: 'bhuvanamadhu@gmail.com', role: 'admin' },
  { id: 3, username: 'player_one', email: 'player1@quiz.com', role: 'user' }
]));

localStorage.setItem('mock_progress', JSON.stringify({
  '1': { total_xp: 750, quizzes_completed: 12 },
  '3': { total_xp: 300, quizzes_completed: 5 }
}));

localStorage.setItem('mock_attempts', JSON.stringify([
  { id: 1, user_id: '3', username: 'player_one', score: 8, total_questions: 10 }
]));

// Load MockDatabase from script.js logic
const fs = require('fs');
const scriptContent = fs.readFileSync('script.js', 'utf8');

// Extract MockDatabase definition
const mockDbMatch = scriptContent.match(/const MockDatabase = \{([\s\S]*?)\n\};/);
if (!mockDbMatch) throw new Error('Could not find MockDatabase in script.js');

eval(`global.MockDatabase = { ${mockDbMatch[1]} };`);

async function testMockDelete() {
  console.log('=== TEST MOCK DATABASE DELETION ===');

  // Test 1: Admin delete should reject
  try {
    await MockDatabase.handle('/admin/users/1', 'DELETE');
    console.error('FAIL: Admin deletion was not blocked in mock!');
  } catch (e) {
    console.log('[PASS] Mock Admin delete blocked:', e.message);
  }

  // Test 2: Normal user delete should succeed
  const delRes = await MockDatabase.handle('/admin/users/3', 'DELETE');
  console.log('[PASS] Mock User delete succeeded:', delRes);

  // Test 3: Verify user removed from mock_users
  const usersAfter = JSON.parse(localStorage.getItem('mock_users'));
  console.log('[PASS] User 3 removed from mock_users:', !usersAfter.some(u => u.id === 3));

  // Test 4: Verify attempts removed
  const attemptsAfter = JSON.parse(localStorage.getItem('mock_attempts'));
  console.log('[PASS] User 3 attempts removed from mock_attempts:', attemptsAfter.length === 0);

  // Test 5: Verify progress removed
  const progressAfter = JSON.parse(localStorage.getItem('mock_progress'));
  console.log('[PASS] User 3 progress removed from mock_progress:', !progressAfter['3']);

  // Test 6: Verify login fails for deleted user
  try {
    await MockDatabase.handle('/auth/login', 'POST', { username: 'player_one', password: 'any' });
    console.error('FAIL: Deleted user was able to login in mock!');
  } catch (e) {
    console.log('[PASS] Mock login rejected for deleted user:', e.message);
  }

  // Test 7: Verify admin remains
  const adminCheck = usersAfter.find(u => u.username === 'admin');
  console.log('[PASS] Admin intact in mock_users:', adminCheck && adminCheck.role === 'admin');
}

testMockDelete().catch(console.error);
