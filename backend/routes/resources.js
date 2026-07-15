const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// ── Video Resources ──────────────────────────────────────────
router.get('/', (req, res) => {
  const { module_id, category, type } = req.query;
  let sql = 'SELECT * FROM resources WHERE active = 1';
  const params = [];
  if (module_id) { sql += ' AND module_id = ?'; params.push(module_id); }
  if (category)  { sql += ' AND category = ?';  params.push(category); }
  if (type)      { sql += ' AND type = ?';       params.push(type); }
  sql += ' ORDER BY order_num ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', authenticate, isAdmin, (req, res) => {
  const { module_id, category, type, title, description, video_id, content, order_num } = req.body;
  if (!title || !category || !type) return res.status(400).json({ error: 'title, category, type required' });
  const r = db.prepare('INSERT INTO resources(module_id,category,type,title,description,video_id,content,order_num) VALUES(?,?,?,?,?,?,?,?)').run(module_id||null,category,type,title,description||'',video_id||'',content||'',order_num||0);
  res.status(201).json(db.prepare('SELECT * FROM resources WHERE id=?').get(r.lastInsertRowid));
});

router.delete('/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('UPDATE resources SET active=0 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── User Notes ────────────────────────────────────────────────
router.get('/notes', authenticate, (req, res) => {
  const notes = db.prepare('SELECT * FROM user_notes WHERE user_id=? ORDER BY pinned DESC, updated_at DESC').all(req.user.id);
  res.json(notes);
});

router.post('/notes', authenticate, (req, res) => {
  const { title, content, module_id, color, pinned } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const r = db.prepare('INSERT INTO user_notes(user_id,module_id,title,content,color,pinned) VALUES(?,?,?,?,?,?)').run(req.user.id,module_id||null,title,content||'',color||'yellow',pinned?1:0);
  res.status(201).json(db.prepare('SELECT * FROM user_notes WHERE id=?').get(r.lastInsertRowid));
});

router.put('/notes/:id', authenticate, (req, res) => {
  const note = db.prepare('SELECT * FROM user_notes WHERE id=?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  if (note.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const { title, content, color, pinned } = req.body;
  db.prepare('UPDATE user_notes SET title=?,content=?,color=?,pinned=?,updated_at=? WHERE id=?').run(title||note.title, content||'', color||note.color, pinned?1:0, new Date().toISOString(), req.params.id);
  res.json(db.prepare('SELECT * FROM user_notes WHERE id=?').get(req.params.id));
});

router.delete('/notes/:id', authenticate, (req, res) => {
  const note = db.prepare('SELECT * FROM user_notes WHERE id=?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  if (note.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
  db.prepare('DELETE FROM user_notes WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
