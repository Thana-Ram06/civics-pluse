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
/*
  The server implementation has been commented out to allow a pure frontend
  static deployment. The original server used Node/Express and a database.
  For a static-only version we keep this file for reference but do not run it.

  If you need the server back, uncomment this file and ensure the environment
  supports Node and any required native modules.

  -- server.js (commented out) --

*/
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
