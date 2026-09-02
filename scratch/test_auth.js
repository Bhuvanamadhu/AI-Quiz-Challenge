const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://127.0.0.1:5500',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,authorization'
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});

req.on('error', (err) => {
  console.error('ERROR:', err.message);
});

req.end();
