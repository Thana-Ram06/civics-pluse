const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  db.findUserByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (!user || user.password !== password || user.role !== role) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const { password: pwd, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  });
});

app.post('/api/auth/register', (req, res) => {
  const userData = req.body;
  db.findUserByEmail(userData.email, (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });
    db.createUser(userData, (err2, created) => {
      if (err2) return res.status(500).json({ success: false, message: 'Failed to create user' });
      const { password, ...userWithoutPassword } = created;
      res.json({ success: true, user: userWithoutPassword });
    });
  });
});

// Issues
app.get('/api/issues', (req, res) => {
  const { status, issueType, priority, search, reportedBy } = req.query;
  db.getIssues({ status, issueType, priority, reportedBy }, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    let issues = rows || [];
    if (search) {
      const term = search.toLowerCase();
      issues = issues.filter(i => (i.title && i.title.toLowerCase().includes(term)) || (i.description && i.description.toLowerCase().includes(term)) || (i.location && i.location.address && i.location.address.toLowerCase().includes(term)));
    }
    issues.forEach(issue => { issue.daysOpen = Math.ceil((new Date() - new Date(issue.reportedDate)) / (1000 * 60 * 60 * 24)); });
    res.json(issues);
  });
});

app.post('/api/issues', (req, res) => {
  // Helper to build and persist the issue from a request object
  function handleIssueRequest(rq, rs) {
    const body = rq.body || {};
    let location = {};
    if (body.location) {
      try {
        location = typeof body.location === 'string' ? JSON.parse(body.location) : body.location;
      } catch (e) {
        location = { address: body.location };
      }
    }

    const imageUrl = rq.file ? `https://via.placeholder.com/400x300?text=${encodeURIComponent(body.title || body.issueType || 'Issue')}` : (body.imageUrl || null);
    const issue = {
      title: body.title || body.issueType,
      description: body.description,
      issueType: body.issueType,
      location,
      priority: body.priority || 'low',
      imageUrl,
      reportedBy: body.reportedBy || 'anonymous',
      reporterName: body.reporterName || null,
      reporterEmail: body.reporterEmail || null,
      ward: body.ward || null
    };

    db.createIssue(issue, (err, created) => {
      if (err) return rs.status(500).json({ success: false, message: 'DB error' });
      rs.json({ success: true, issue: created });
    });
  }

  // If request is multipart/form-data, let multer parse it; otherwise handle JSON body
  if (req.is && req.is('multipart/form-data')) {
    upload.single('image')(req, res, function(err) {
      if (err) return res.status(400).json({ success: false, message: 'Upload error' });
      handleIssueRequest(req, res);
    });
  } else {
    handleIssueRequest(req, res);
  }
});

app.put('/api/issues/:id/status', (req, res) => {
  const { id } = req.params; const { status, adminNotes } = req.body;
  db.updateIssueStatus(id, status, adminNotes, (err, updated) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, issue: updated });
  });
});

app.post('/api/issues/:id/rate', (req, res) => {
  const { id } = req.params; const { rating, comments } = req.body;
  db.rateIssue(id, rating, comments, (err, updated) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, issue: updated });
  });
});

app.post('/api/issues/:id/vote', (req, res) => {
  const { id } = req.params; const { voteValue, comments } = req.body;
  db.voteIssue(id, voteValue, comments, (err, updated) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, issue: updated });
  });
});

app.get('/api/statistics', (req, res) => {
  db.getStatistics((err, stats) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json(stats);
  });
});

// Auto-escalate delayed issues (background)
function checkDelayedIssues() {
  db.getIssues({}, (err, rows) => {
    if (err || !rows) return;
    const now = new Date();
    rows.forEach(issue => {
      const days = Math.ceil((now - new Date(issue.reportedDate)) / (1000 * 60 * 60 * 24));
      if (issue.status === 'pending' && days > 3) db.updateIssueStatus(issue.id, 'delayed', issue.adminNotes || '', () => {});
    });
  });
}

// Initialize DB but avoid starting background tasks or a listener when this file
// is required by serverless platforms (we only want them when running as a standalone server).
db.init();

if (require.main === module) {
  // Only start background tasks and the listener when run directly (node server.js)
  setInterval(checkDelayedIssues, 5 * 60 * 1000);

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express `app` so it can be required by serverless wrappers (e.g. Vercel API functions)
module.exports = app;
