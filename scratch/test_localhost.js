const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/leaderboard',
  method: 'GET'
}, (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 100));
  });
});

req.on('error', (err) => {
  console.error('ERROR:', err.message);
});

req.end();
