const authController = require('../backend/controllers/auth');

async function testVariations() {
  const inputs = ['Bhuvana', 'bhuvana', 'admin', 'bhuvanamadhu@gmail.com'];
  for (const input of inputs) {
    let responseData = null;
    const req = {
      body: { username: input, password: 'admin123' },
      headers: {},
      socket: {}
    };
    const res = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(payload) { responseData = { statusCode: this.statusCode || 200, payload }; return this; }
    };
    await authController.login(req, res);
    console.log(`Testing username input [${input}]: Status ${responseData ? responseData.statusCode : 'ERR'}, Role: ${responseData?.payload?.user?.role}, Username: ${responseData?.payload?.user?.username}`);
  }
}

testVariations();
