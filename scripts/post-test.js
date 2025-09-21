const http = require('http');

const postData = JSON.stringify({
  title: 'Automated Test Issue',
  description: 'Created by scripts/post-test.js',
  issueType: 'other',
  location: { address: 'Scripted Ave' },
  priority: 'low',
  reportedBy: 'citizen@example.com',
  reporterName: 'Script Agent',
  reporterEmail: 'script@example.com'
});

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ statusCode: res.statusCode, body: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log('Posting test issue to http://127.0.0.1:3000/api/issues');
    const post = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } }, postData);
    console.log('POST status:', post.statusCode);
    console.log('POST body:', post.body);

    console.log('\nFetching /api/issues');
    const get = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues', method: 'GET' });
    console.log('GET status:', get.statusCode);
    if (Array.isArray(get.body)) console.log('Total issues:', get.body.length);
    else console.log('GET body:', get.body);
  } catch (err) {
    console.error('Test failed:', err.message || err);
    process.exit(1);
  }
})();
