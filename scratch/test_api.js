const http = require('http');

http.get('http://127.0.0.1:5000/api/quiz/questions?category=JavaScript&difficulty=easy', (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
