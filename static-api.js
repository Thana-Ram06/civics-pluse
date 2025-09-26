/*
  static-api.js

  Small in-browser persistence layer for the static-only version of the app.
  It stores data under localStorage key `civicplus_db_v1` and exposes a
  Promise-based API similar to a simple REST client so existing frontend
  scripts can call it without heavy changes.

  Usage (from client code):
    window.StaticAPI.listIssues().then(issues => ...)
    window.StaticAPI.createIssue(issue).then(created => ...)

  The data model is minimal and compatible with the previous server API:
    { issues: [ { id, title, description, status, createdAt, votes, rating } ],
      users: [ { id, name, email } ] }
*/

(function () {
  const STORAGE_KEY = 'civicplus_db_v1'

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { issues: [], users: [] }
      return JSON.parse(raw)
    } catch (e) {
      console.error('StaticAPI: failed to load DB', e)
      return { issues: [], users: [] }
    }
  }

  function save(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }

  function nextId(items) {
    return items.length ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
  }

  const api = {
    listIssues() {
      return new Promise((resolve) => {
        const db = load()
        // return a shallow copy
        resolve(db.issues.slice().sort((a, b) => b.id - a.id))
      })
    },

    createIssue(issue) {
      return new Promise((resolve) => {
        const db = load()
        const id = nextId(db.issues)
        const now = new Date().toISOString()
        const saved = Object.assign({
          id,
          title: '',
          description: '',
          status: 'open',
          createdAt: now,
          votes: 0,
          rating: null,
        }, issue)
        db.issues.push(saved)
        save(db)
        resolve(saved)
      })
    },

    getIssue(id) {
      return new Promise((resolve) => {
        const db = load()
        resolve(db.issues.find(i => i.id === Number(id)) || null)
      })
    },

    updateIssue(id, patch) {
      return new Promise((resolve) => {
        const db = load()
        const idx = db.issues.findIndex(i => i.id === Number(id))
        if (idx === -1) return resolve(null)
        db.issues[idx] = Object.assign({}, db.issues[idx], patch)
        save(db)
        resolve(db.issues[idx])
      })
    },

    findUserByEmail(email) {
      return new Promise((resolve) => {
        const db = load()
        resolve(db.users.find(u => u.email === email) || null)
      })
    },

    createUser(user) {
      return new Promise((resolve) => {
        const db = load()
        const id = nextId(db.users)
        const saved = Object.assign({ id }, user)
        db.users.push(saved)
        save(db)
        resolve(saved)
      })
    },

    // convenience used by some frontend pages
    clear() {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  window.StaticAPI = api
})();
// static-api.js
// A simple in-browser "API" implemented using localStorage so the app can run
// entirely as static HTML/CSS/JS without a Node backend.

const StaticAPI = (() => {
  const KEY = 'civicplus_db_v1';

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed = {
        users: [
          { id: 1, email: 'citizen@example.com', name: 'John Citizen', role: 'citizen', ward: 'ward1', password: 'password123', registeredDate: new Date().toISOString() },
          { id: 2, email: 'admin@example.com', name: 'Jane Admin', role: 'admin', ward: 'ward1', password: 'admin123', registeredDate: new Date().toISOString() }
        ],
        issues: [
          { id: 1, title: 'Large Pothole on Main Street', description: 'A large pothole causing traffic congestion and vehicle damage', issueType: 'pothole', location: { address: 'Main Street, Downtown' }, priority: 'high', status: 'pending', reportedDate: '2024-01-15', reporterName: 'John Citizen', reporterEmail: 'john@example.com', imageUrl: 'https://via.placeholder.com/400x300?text=Pothole+Issue', adminNotes: '', daysOpen: 3, rating: null, reportedBy: 'citizen@example.com', ward: 'ward1', votes: 0, voteScore: 0 }
        ]
      };
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    try { return JSON.parse(raw); } catch (e) { const s = { users: [], issues: [] }; localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  }

  function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }

  function listIssues() {
    const db = load();
    return Promise.resolve(db.issues.slice().reverse());
  }

  function createIssue(issue) {
    const db = load();
    const nextId = db.issues.length ? Math.max(...db.issues.map(i => i.id)) + 1 : 1;
    const now = new Date().toISOString().split('T')[0];
    const row = Object.assign({ id: nextId, status: 'pending', reportedDate: now, votes: 0, voteScore: 0, daysOpen: 0 }, issue);
    db.issues.push(row);
    save(db);
    return Promise.resolve(row);
  }

  function getIssue(id) {
    const db = load();
    const row = db.issues.find(i => i.id == id) || null;
    return Promise.resolve(row);
  }

  function updateIssue(id, patch) {
    const db = load();
    const idx = db.issues.findIndex(i => i.id == id);
    if (idx === -1) return Promise.reject(new Error('Not found'));
    db.issues[idx] = Object.assign({}, db.issues[idx], patch);
    save(db);
    return Promise.resolve(db.issues[idx]);
  }

  function findUserByEmail(email) {
    const db = load();
    const u = db.users.find(x => x.email === email) || null;
    return Promise.resolve(u);
  }

  function createUser(user) {
    const db = load();
    const nextId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const obj = { id: nextId, email: user.email, name: user.name, role: user.role || 'citizen', ward: user.ward || null, password: user.password || null, registeredDate: new Date().toISOString() };
    db.users.push(obj);
    save(db);
    return Promise.resolve(obj);
  }

  return { listIssues, createIssue, getIssue, updateIssue, findUserByEmail, createUser };
})();

// Expose globally so existing client scripts can use it when window.StaticAPI exists
window.StaticAPI = StaticAPI;
