const path = require('path');
const fs = require('fs');
let useSqlite = true;
let db;
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'civicplus.db');
const JSON_DB = path.join(DB_DIR, 'db.json');

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Try to require sqlite3; if it fails, fall back to a JSON file store
try {
  const sqlite3 = require('sqlite3').verbose();
  ensureDir();
  db = new sqlite3.Database(DB_PATH);
  useSqlite = true;
} catch (e) {
  console.warn('sqlite3 not available, falling back to JSON file storage:', e.message);
  useSqlite = false;
  // ensure data dir and json file
  ensureDir();
  if (!fs.existsSync(JSON_DB)) {
    fs.writeFileSync(JSON_DB, JSON.stringify({ users: [], issues: [] }, null, 2));
  }
  // load into memory
  const raw = fs.readFileSync(JSON_DB, 'utf8');
  try { db = JSON.parse(raw); } catch (err) { db = { users: [], issues: [] }; }
}

function persistJson() {
  if (!useSqlite) {
    fs.writeFileSync(JSON_DB, JSON.stringify(db, null, 2));
  }
}

function init() {
  if (useSqlite) {
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT,
        ward TEXT,
        password TEXT,
        registeredDate TEXT
      );
    `;

    const createIssues = `
      CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        issueType TEXT,
        location TEXT,
        priority TEXT,
        status TEXT,
        reportedDate TEXT,
        reporterName TEXT,
        reporterEmail TEXT,
        imageUrl TEXT,
        adminNotes TEXT,
        daysOpen INTEGER DEFAULT 0,
        rating REAL,
        reportedBy TEXT,
        ward TEXT,
        votes INTEGER DEFAULT 0,
        voteScore INTEGER DEFAULT 0
      );
    `;

    db.serialize(() => {
      db.run(createUsers);
      db.run(createIssues);

      // Seed default users if none exist
      db.get('SELECT COUNT(*) as cnt FROM users', (err, row) => {
        if (err) return console.error('DB error', err);
        if (row && row.cnt === 0) {
          const stmt = db.prepare(`INSERT INTO users (email, name, role, ward, password, registeredDate) VALUES (?,?,?,?,?,?)`);
          stmt.run('citizen@example.com', 'John Citizen', 'citizen', 'ward1', 'password123', new Date().toISOString());
          stmt.run('admin@example.com', 'Jane Admin', 'admin', 'ward1', 'admin123', new Date().toISOString());
          stmt.finalize();
          console.log('Seeded users');
        }
      });

      // Seed sample issues if none exist
      db.get('SELECT COUNT(*) as cnt FROM issues', (err, row) => {
        if (err) return console.error('DB error', err);
        if (row && row.cnt === 0) {
          const insert = `INSERT INTO issues (title, description, issueType, location, priority, status, reportedDate, reporterName, reporterEmail, imageUrl, adminNotes, daysOpen, rating, reportedBy, ward) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
          const stmt = db.prepare(insert);
          stmt.run('Large Pothole on Main Street', 'A large pothole causing traffic congestion and vehicle damage', 'pothole', JSON.stringify({ address: 'Main Street, Downtown', lat: 40.7128, lng: -74.0060 }), 'high', 'pending', '2024-01-15', 'John Citizen', 'john@example.com', 'https://via.placeholder.com/400x300?text=Pothole+Issue', '', 3, null, 'citizen@example.com', 'ward1');
          stmt.run('Broken Streetlight', 'Streetlight not working for over 2 weeks, making area unsafe at night', 'streetlight', JSON.stringify({ address: 'Oak Avenue, Residential Area', lat: 40.7589, lng: -73.9851 }), 'medium', 'resolved', '2024-01-10', 'Jane Smith', 'jane@example.com', 'https://via.placeholder.com/400x300?text=Broken+Streetlight', 'Fixed by replacing the faulty bulb and checking electrical connections', 0, 4.2, 'jane@example.com', 'ward2');
          stmt.finalize();
          console.log('Seeded issues');
        }
      });
    });
  } else {
    // JSON fallback: ensure seeded users and issues
    if (!db.users || db.users.length === 0) {
      db.users = [
        { id: 1, email: 'citizen@example.com', name: 'John Citizen', role: 'citizen', ward: 'ward1', password: 'password123', registeredDate: new Date().toISOString() },
        { id: 2, email: 'admin@example.com', name: 'Jane Admin', role: 'admin', ward: 'ward1', password: 'admin123', registeredDate: new Date().toISOString() }
      ];
    }
    if (!db.issues || db.issues.length === 0) {
      db.issues = [
        { id: 1, title: 'Large Pothole on Main Street', description: 'A large pothole causing traffic congestion and vehicle damage', issueType: 'pothole', location: { address: 'Main Street, Downtown', lat: 40.7128, lng: -74.0060 }, priority: 'high', status: 'pending', reportedDate: '2024-01-15', reporterName: 'John Citizen', reporterEmail: 'john@example.com', imageUrl: 'https://via.placeholder.com/400x300?text=Pothole+Issue', adminNotes: '', daysOpen: 3, rating: null, reportedBy: 'citizen@example.com', ward: 'ward1', votes: 0, voteScore: 0 },
        { id: 2, title: 'Broken Streetlight', description: 'Streetlight not working for over 2 weeks, making area unsafe at night', issueType: 'streetlight', location: { address: 'Oak Avenue, Residential Area', lat: 40.7589, lng: -73.9851 }, priority: 'medium', status: 'resolved', reportedDate: '2024-01-10', reporterName: 'Jane Smith', reporterEmail: 'jane@example.com', imageUrl: 'https://via.placeholder.com/400x300?text=Broken+Streetlight', adminNotes: 'Fixed by replacing the faulty bulb and checking electrical connections', daysOpen: 0, rating: 4.2, reportedBy: 'jane@example.com', ward: 'ward2', votes: 0, voteScore: 0 }
      ];
    }
    persistJson();
    console.log('Initialized JSON fallback DB at', JSON_DB);
  }
}

function createIssue(issue, callback) {
  if (useSqlite) {
    const sql = `INSERT INTO issues (title, description, issueType, location, priority, status, reportedDate, reporterName, reporterEmail, imageUrl, adminNotes, daysOpen, rating, reportedBy, ward, votes, voteScore) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [
      issue.title,
      issue.description,
      issue.issueType,
      JSON.stringify(issue.location || {}),
      issue.priority || 'low',
      issue.status || 'pending',
      issue.reportedDate || new Date().toISOString().split('T')[0],
      issue.reporterName || null,
      issue.reporterEmail || null,
      issue.imageUrl || null,
      issue.adminNotes || '',
      issue.daysOpen || 0,
      issue.rating || null,
      issue.reportedBy || null,
      issue.ward || null,
      issue.votes || 0,
      issue.voteScore || 0
    ];

    db.run(sql, params, function(err) {
      if (err) return callback(err);
      // Return the newly created issue (with id)
      db.get('SELECT * FROM issues WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) return callback(err2);
        // parse location
        if (row && row.location) {
          try { row.location = JSON.parse(row.location); } catch(e) { /* ignore */ }
        }
        callback(null, row);
      });
    });
  } else {
    try {
      const now = issue.reportedDate || new Date().toISOString().split('T')[0];
      const nextId = db.issues.length ? Math.max(...db.issues.map(i => i.id)) + 1 : 1;
      const row = {
        id: nextId,
        title: issue.title,
        description: issue.description,
        issueType: issue.issueType,
        location: issue.location || {},
        priority: issue.priority || 'low',
        status: issue.status || 'pending',
        reportedDate: now,
        reporterName: issue.reporterName || null,
        reporterEmail: issue.reporterEmail || null,
        imageUrl: issue.imageUrl || null,
        adminNotes: issue.adminNotes || '',
        daysOpen: issue.daysOpen || 0,
        rating: issue.rating || null,
        reportedBy: issue.reportedBy || null,
        ward: issue.ward || null,
        votes: issue.votes || 0,
        voteScore: issue.voteScore || 0
      };
      db.issues.push(row);
      persistJson();
      callback(null, row);
    } catch (err) { callback(err); }
  }
}

function getIssues(filters = {}, callback) {
  if (useSqlite) {
    let sql = 'SELECT * FROM issues';
    const clauses = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      clauses.push('status = ?');
      params.push(filters.status);
    }
    if (filters.issueType) {
      clauses.push('issueType = ?');
      params.push(filters.issueType);
    }
    if (filters.priority) {
      clauses.push('priority = ?');
      params.push(filters.priority);
    }
    if (filters.reportedBy) {
      clauses.push('reportedBy = ?');
      params.push(filters.reportedBy);
    }
    if (clauses.length) {
      sql += ' WHERE ' + clauses.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
      if (err) return callback(err);
      rows.forEach(r => {
        if (r.location) {
          try { r.location = JSON.parse(r.location); } catch(e) { r.location = { address: r.location }; }
        }
      });
      callback(null, rows);
    });
  } else {
    try {
      let rows = db.issues.slice();
      if (filters.status && filters.status !== 'all') rows = rows.filter(r => r.status === filters.status);
      if (filters.issueType) rows = rows.filter(r => r.issueType === filters.issueType);
      if (filters.priority) rows = rows.filter(r => r.priority === filters.priority);
      if (filters.reportedBy) rows = rows.filter(r => r.reportedBy === filters.reportedBy);
      callback(null, rows);
    } catch (err) { callback(err); }
  }
}

function findUserByEmail(email, callback) {
  if (useSqlite) {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  } else {
    try {
      const row = db.users.find(u => u.email === email) || null;
      callback(null, row);
    } catch (err) { callback(err); }
  }
}

function createUser(user, callback) {
  if (useSqlite) {
    const sql = `INSERT INTO users (email, name, role, ward, password, registeredDate) VALUES (?,?,?,?,?,?)`;
    const params = [user.email, user.name, user.role, user.ward || null, user.password || null, user.registeredDate || new Date().toISOString()];
    db.run(sql, params, function(err) {
      if (err) return callback(err);
      db.get('SELECT id, email, name, role, ward, registeredDate FROM users WHERE id = ?', [this.lastID], callback);
    });
  } else {
    try {
      const nextId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const obj = { id: nextId, email: user.email, name: user.name, role: user.role, ward: user.ward || null, password: user.password || null, registeredDate: user.registeredDate || new Date().toISOString() };
      db.users.push(obj);
      persistJson();
      // return the selected fields
      callback(null, { id: obj.id, email: obj.email, name: obj.name, role: obj.role, ward: obj.ward, registeredDate: obj.registeredDate });
    } catch (err) { callback(err); }
  }
}

function updateIssueStatus(id, status, adminNotes, callback) {
  if (useSqlite) {
    const sql = `UPDATE issues SET status = ?, adminNotes = ? WHERE id = ?`;
    db.run(sql, [status, adminNotes || '', id], function(err) {
      if (err) return callback(err);
      db.get('SELECT * FROM issues WHERE id = ?', [id], (err2, row) => {
        if (row && row.location) {
          try { row.location = JSON.parse(row.location); } catch(e) { /* ignore */ }
        }
        callback(err2, row);
      });
    });
  } else {
    try {
      const idx = db.issues.findIndex(i => i.id == id);
      if (idx === -1) return callback(new Error('Not found'));
      db.issues[idx].status = status;
      db.issues[idx].adminNotes = adminNotes || '';
      persistJson();
      callback(null, db.issues[idx]);
    } catch (err) { callback(err); }
  }
}

function rateIssue(id, rating, comments, callback) {
  if (useSqlite) {
    const sql = `UPDATE issues SET rating = ?, adminNotes = ? WHERE id = ?`;
    db.run(sql, [rating, comments || '', id], function(err) {
      if (err) return callback(err);
      db.get('SELECT * FROM issues WHERE id = ?', [id], (err2, row) => {
        if (row && row.location) {
          try { row.location = JSON.parse(row.location); } catch(e) { /* ignore */ }
        }
        callback(err2, row);
      });
    });
  } else {
    try {
      const idx = db.issues.findIndex(i => i.id == id);
      if (idx === -1) return callback(new Error('Not found'));
      db.issues[idx].rating = rating;
      db.issues[idx].adminNotes = comments || '';
      persistJson();
      callback(null, db.issues[idx]);
    } catch (err) { callback(err); }
  }
}

function voteIssue(id, voteValue, comments, callback) {
  if (useSqlite) {
    const sql = `UPDATE issues SET votes = COALESCE(votes,0) + 1, voteScore = COALESCE(voteScore,0) + ? , adminNotes = ? WHERE id = ?`;
    db.run(sql, [voteValue, comments || '', id], function(err) {
      if (err) return callback(err);
      db.get('SELECT * FROM issues WHERE id = ?', [id], (err2, row) => {
        if (row && row.location) {
          try { row.location = JSON.parse(row.location); } catch(e) { /* ignore */ }
        }
        callback(err2, row);
      });
    });
  } else {
    try {
      const idx = db.issues.findIndex(i => i.id == id);
      if (idx === -1) return callback(new Error('Not found'));
      db.issues[idx].votes = (db.issues[idx].votes || 0) + 1;
      db.issues[idx].voteScore = (db.issues[idx].voteScore || 0) + Number(voteValue || 0);
      db.issues[idx].adminNotes = comments || db.issues[idx].adminNotes || '';
      persistJson();
      callback(null, db.issues[idx]);
    } catch (err) { callback(err); }
  }
}

function getStatistics(callback) {
  if (useSqlite) {
    const stats = {};
    db.serialize(() => {
      db.get('SELECT COUNT(*) as total FROM issues', (err, row) => {
        stats.total = row ? row.total : 0;
        db.get("SELECT COUNT(*) as pending FROM issues WHERE status = 'pending'", (err2, row2) => {
          stats.pending = row2 ? row2.pending : 0;
          db.get("SELECT COUNT(*) as resolved FROM issues WHERE status = 'resolved'", (err3, row3) => {
            stats.resolved = row3 ? row3.resolved : 0;
            db.get("SELECT COUNT(*) as delayed FROM issues WHERE status = 'delayed'", (err4, row4) => {
              stats.delayed = row4 ? row4.delayed : 0;
              db.get('SELECT AVG(rating) as avgRating FROM issues WHERE rating IS NOT NULL', (err5, row5) => {
                stats.averageRating = row5 && row5.avgRating ? Number(row5.avgRating).toFixed(1) : 0;
                db.get('SELECT SUM(votes) as totalVotes FROM issues', (err6, row6) => {
                  stats.totalVotes = row6 && row6.totalVotes ? row6.totalVotes : 0;
                  stats.responseRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                  callback(null, stats);
                });
              });
            });
          });
        });
      });
    });
  } else {
    try {
      const issues = db.issues || [];
      const stats = {};
      stats.total = issues.length;
      stats.pending = issues.filter(i => i.status === 'pending').length;
      stats.resolved = issues.filter(i => i.status === 'resolved').length;
      stats.delayed = issues.filter(i => i.status === 'delayed').length;
      const ratings = issues.map(i => i.rating).filter(r => r != null);
      stats.averageRating = ratings.length ? (ratings.reduce((a,b)=>a+Number(b),0)/ratings.length).toFixed(1) : 0;
      stats.totalVotes = issues.reduce((s,i)=>s + (i.votes||0), 0);
      stats.responseRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
      callback(null, stats);
    } catch (err) { callback(err); }
  }
}

module.exports = {
  init,
  createIssue,
  getIssues,
  findUserByEmail,
  createUser,
  updateIssueStatus,
  rateIssue,
  voteIssue,
  getStatistics
};
