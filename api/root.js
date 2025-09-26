const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const indexPath = path.join(process.cwd(), 'index.html');
    if (!fs.existsSync(indexPath)) {
      res.statusCode = 404;
      res.end('index.html not found');
      return;
    }
    const html = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    res.end(html);
  } catch (err) {
    res.statusCode = 500;
    res.end('Server error');
  }
};
