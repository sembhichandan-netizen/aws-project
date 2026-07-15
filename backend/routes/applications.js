const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email,
             vp.name as program_name, vp.country, vp.type
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN visa_programs vp ON a.program_id = vp.id
      ORDER BY a.submitted_at DESC
    `).all());
  }
  res.json(db.prepare(`
    SELECT a.*, vp.name as program_name, vp.country, vp.type, vp.processing_time, vp.fee
    FROM applications a
    JOIN visa_programs vp ON a.program_id = vp.id
    WHERE a.user_id = ?
    ORDER BY a.submitted_at DESC
  `).all(req.user.id));
});

router.post('/', authenticate, (req, res) => {
  const { program_id, notes } = req.body;
  if (!program_id) return res.status(400).json({ error: 'Program ID required' });

  const existing = db.prepare(
    "SELECT id FROM applications WHERE user_id=? AND program_id=? AND status NOT IN ('rejected','withdrawn')"
  ).get(req.user.id, program_id);

  if (existing)
    return res.status(400).json({ error: 'You already have an active application for this program' });

  const result = db.prepare(
    'INSERT INTO applications (user_id, program_id, notes) VALUES (?, ?, ?)'
  ).run(req.user.id, program_id, notes || null);

  const app = db.prepare(`
    SELECT a.*, vp.name as program_name, vp.country, vp.type
    FROM applications a JOIN visa_programs vp ON a.program_id = vp.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(app);
});

router.put('/:id/status', authenticate, isAdmin, (req, res) => {
  const { status, admin_notes } = req.body;
  db.prepare(
    'UPDATE applications SET status=?, admin_notes=?, updated_at=? WHERE id=?'
  ).run(status, admin_notes || null, new Date().toISOString(), req.params.id);

  res.json(db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticate, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not authorized' });

  db.prepare("UPDATE applications SET status='withdrawn' WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
