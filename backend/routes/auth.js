const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'ava_secret';

// Only 'user' and 'consultant' are self-registerable — admin must be created manually
const ALLOWED_ROLES = ['user', 'consultant'];

router.post('/register', (req, res) => {
  const { name, email, password, phone, nationality, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  const assignedRole = ALLOWED_ROLES.includes(role) ? role : 'user';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email is already registered' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, phone, nationality) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email, hashed, assignedRole, phone || null, nationality || null);

  const user = db.prepare('SELECT id, name, email, role, phone, nationality, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const { password: _, ...userData } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });

  res.json({ token, user: userData });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, phone, nationality, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
