const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const requireAdmin = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login   body: { username, password }
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ status: 'error', message: 'Username and password are required' });
    }
    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ status: 'error', message: 'Username or password is too long' });
    }

    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username.trim()]);
    const admin = result.rows[0];
    const valid = admin ? await bcrypt.compare(password, admin.password_hash) : false;

    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({ status: 'ok', token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ status: 'error', message: 'Could not log in right now' });
  }
});

// GET /api/auth/me  (needs a valid token)
router.get('/me', requireAdmin, (req, res) => {
  res.json({ status: 'ok', username: req.admin.username });
});

module.exports = router;