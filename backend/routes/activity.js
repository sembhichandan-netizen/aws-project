const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Update current user's last_seen and current_page (called by frontend)
router.post('/ping', authenticate, (req, res) => {
  const { page } = req.body;
  db.prepare(`UPDATE users SET last_seen = ?, current_page = ? WHERE id = ?`)
    .run(new Date().toISOString(), page || null, req.user.id);
  res.json({ ok: true });
});

// Log an activity
router.post('/log', authenticate, (req, res) => {
  const { action, detail } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  db.prepare(`INSERT INTO activity_log(user_id, action, detail) VALUES(?,?,?)`)
    .run(req.user.id, action, detail || null);
  res.json({ ok: true });
});

// Admin: get online users (seen in last 5 min)
router.get('/online', authenticate, (req, res) => {
  if (!['admin','consultant'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const users = db.prepare(`
    SELECT id, name, email, role, nationality, current_page, last_seen
    FROM users
    WHERE last_seen >= ? AND role = 'user'
    ORDER BY last_seen DESC
  `).all(fiveMinAgo);
  res.json(users);
});

// Admin: get recent activity feed
router.get('/feed', authenticate, (req, res) => {
  if (!['admin','consultant'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });

  const feed = db.prepare(`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_log al
    JOIN users u ON al.user_id = u.id
    WHERE u.role = 'user'
    ORDER BY al.created_at DESC
    LIMIT 50
  `).all();
  res.json(feed);
});

// Admin: student detail — what one student has been doing
router.get('/student/:id', authenticate, (req, res) => {
  if (!['admin','consultant'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });

  const sid = req.params.id;
  const user = db.prepare('SELECT id,name,email,role,nationality,phone,last_seen,current_page,created_at FROM users WHERE id=?').get(sid);
  if (!user) return res.status(404).json({ error: 'Not found' });

  const apps     = db.prepare(`SELECT a.*, vp.name as program_name, vp.country FROM applications a JOIN visa_programs vp ON a.program_id=vp.id WHERE a.user_id=? ORDER BY a.submitted_at DESC`).all(sid);
  const docs     = db.prepare(`SELECT * FROM documents WHERE user_id=? ORDER BY uploaded_at DESC`).all(sid);
  const progress = db.prepare(`SELECT lp.*, lm.title FROM learning_progress lp JOIN learning_modules lm ON lp.module_id=lm.id WHERE lp.user_id=?`).all(sid);
  const assess   = db.prepare(`SELECT * FROM assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 5`).all(sid);
  const activity = db.prepare(`SELECT * FROM activity_log WHERE user_id=? ORDER BY created_at DESC LIMIT 30`).all(sid);

  res.json({ user, apps, docs, progress, assess, activity });
});

module.exports = router;
