const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const modules = db.prepare('SELECT * FROM learning_modules WHERE active = 1 ORDER BY id').all();
  res.json(modules);
});

router.get('/progress', authenticate, (req, res) => {
  const rows = db.prepare(`
    SELECT lp.*, lm.title, lm.category, lm.duration_minutes, lm.level, lm.description
    FROM learning_progress lp
    JOIN learning_modules lm ON lp.module_id = lm.id
    WHERE lp.user_id = ?
  `).all(req.user.id);
  res.json(rows);
});

router.post('/:id/progress', authenticate, (req, res) => {
  const { progress_percent, completed } = req.body;
  const modId = parseInt(req.params.id);

  const existing = db.prepare(
    'SELECT id FROM learning_progress WHERE user_id = ? AND module_id = ?'
  ).get(req.user.id, modId);

  if (existing) {
    db.prepare(
      'UPDATE learning_progress SET progress_percent=?, completed=?, completed_at=? WHERE user_id=? AND module_id=?'
    ).run(progress_percent, completed ? 1 : 0, completed ? new Date().toISOString() : null, req.user.id, modId);
  } else {
    db.prepare(
      'INSERT INTO learning_progress (user_id, module_id, progress_percent, completed) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, modId, progress_percent || 0, completed ? 1 : 0);
  }

  res.json({ success: true });
});

router.post('/', authenticate, isAdmin, (req, res) => {
  const { title, category, description, content, duration_minutes, level } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Title and category required' });

  const result = db.prepare(
    'INSERT INTO learning_modules (title, category, description, content, duration_minutes, level) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, category, description || '', content || '', duration_minutes || 30, level || 'Beginner');

  res.status(201).json(db.prepare('SELECT * FROM learning_modules WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('UPDATE learning_modules SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
