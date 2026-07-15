const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const programs = db.prepare('SELECT * FROM visa_programs WHERE active = 1 ORDER BY created_at DESC').all();
  res.json(programs);
});

router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM visa_programs WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Program not found' });
  res.json(p);
});

router.post('/', authenticate, isAdmin, (req, res) => {
  const { name, country, type, description, requirements, processing_time, fee, success_rate } = req.body;
  if (!name || !country || !type)
    return res.status(400).json({ error: 'Name, country and type are required' });

  const result = db.prepare(
    'INSERT INTO visa_programs (name, country, type, description, requirements, processing_time, fee, success_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, country, type, description || '', requirements || '', processing_time || '', fee || '', success_rate || 80);

  res.status(201).json(db.prepare('SELECT * FROM visa_programs WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', authenticate, isAdmin, (req, res) => {
  const { name, country, type, description, requirements, processing_time, fee, success_rate, active } = req.body;
  db.prepare(
    'UPDATE visa_programs SET name=?, country=?, type=?, description=?, requirements=?, processing_time=?, fee=?, success_rate=?, active=? WHERE id=?'
  ).run(name, country, type, description, requirements, processing_time, fee, success_rate, active ?? 1, req.params.id);

  res.json(db.prepare('SELECT * FROM visa_programs WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticate, isAdmin, (req, res) => {
  db.prepare('UPDATE visa_programs SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
