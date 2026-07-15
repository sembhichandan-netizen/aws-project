const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// STATIC ROUTES MUST BE BEFORE /:id

router.get('/mine/list', authenticate, (req, res) => {
  if (!['consultant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Consultants only' });
  res.json(db.prepare(`SELECT s.*,(SELECT COUNT(*) FROM service_inquiries WHERE service_id=s.id) as inquiry_count FROM services s WHERE s.consultant_id=? ORDER BY s.created_at DESC`).all(req.user.id));
});

router.get('/inquiries/mine', authenticate, (req, res) => {
  if (!['consultant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Consultants only' });
  res.json(db.prepare(`SELECT si.*,s.title as service_title,u.name as student_name,u.email as student_email FROM service_inquiries si JOIN services s ON si.service_id=s.id JOIN users u ON si.student_id=u.id WHERE s.consultant_id=? ORDER BY si.created_at DESC`).all(req.user.id));
});

router.get('/', (req, res) => {
  const { category, country, search } = req.query;
  let sql = `SELECT s.*,u.name as consultant_name,u.email as consultant_email,(SELECT COUNT(*) FROM service_inquiries WHERE service_id=s.id) as inquiry_count FROM services s JOIN users u ON s.consultant_id=u.id WHERE s.active=1`;
  const params = [];
  if (category) { sql += ' AND s.category=?'; params.push(category); }
  if (country)  { sql += ' AND s.countries LIKE ?'; params.push(`%${country}%`); }
  if (search)   { sql += ' AND (s.title LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)'; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  sql += ' ORDER BY s.featured DESC, s.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const s = db.prepare(`SELECT s.*,u.name as consultant_name,u.email as consultant_email,u.phone as consultant_phone FROM services s JOIN users u ON s.consultant_id=u.id WHERE s.id=? AND s.active=1`).get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

router.post('/', authenticate, (req, res) => {
  if (!['consultant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Consultants only' });
  const { title, category, description, price, currency, duration, countries, tags, featured } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'title and category required' });
  const r = db.prepare(`INSERT INTO services(consultant_id,title,category,description,price,currency,duration,countries,tags,featured) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(req.user.id,title,category,description||'',price||'',currency||'INR',duration||'',countries||'',tags||'',featured?1:0);
  res.status(201).json(db.prepare('SELECT * FROM services WHERE id=?').get(r.lastInsertRowid));
});

router.put('/:id', authenticate, (req, res) => {
  const svc = db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id);
  if (!svc) return res.status(404).json({ error: 'Not found' });
  if (svc.consultant_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
  const { title, category, description, price, currency, duration, countries, tags, featured, active } = req.body;
  db.prepare(`UPDATE services SET title=?,category=?,description=?,price=?,currency=?,duration=?,countries=?,tags=?,featured=?,active=? WHERE id=?`).run(title,category,description||'',price||'',currency||'INR',duration||'',countries||'',tags||'',featured?1:0,active??1,req.params.id);
  res.json(db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id));
});

router.delete('/:id', authenticate, (req, res) => {
  const svc = db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id);
  if (!svc) return res.status(404).json({ error: 'Not found' });
  if (svc.consultant_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
  db.prepare('UPDATE services SET active=0 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/inquire', authenticate, (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: 'Students only' });
  const svc = db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id);
  if (!svc) return res.status(404).json({ error: 'Not found' });
  const existing = db.prepare('SELECT id FROM service_inquiries WHERE service_id=? AND student_id=?').get(req.params.id, req.user.id);
  if (existing) return res.status(400).json({ error: 'You already sent an inquiry for this service.' });
  const r = db.prepare('INSERT INTO service_inquiries(service_id,student_id,message) VALUES(?,?,?)').run(req.params.id, req.user.id, req.body.message||'');
  const threadId = `student_${req.user.id}`;
  const autoMsg = `Hi! I am interested in your service: "${svc.title}". ${req.body.message||'Please get in touch with me.'}`;
  db.prepare('INSERT INTO messages(from_user_id,thread_id,content) VALUES(?,?,?)').run(req.user.id, threadId, autoMsg);
  res.status(201).json({ success: true, inquiry_id: r.lastInsertRowid });
});

module.exports = router;
