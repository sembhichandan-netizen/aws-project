const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All consultants (for discovery)
router.get('/consultants', authenticate, (req, res) => {
  if (!['consultant','admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Consultants only' });

  const list = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.nationality, u.created_at,
      (SELECT COUNT(*) FROM services WHERE consultant_id=u.id AND active=1) as service_count
    FROM users u WHERE u.role='consultant' AND u.id != ?
    ORDER BY u.name
  `).all(req.user.id);

  const withStatus = list.map(c => {
    const conn = db.prepare(`SELECT * FROM b2b_connections WHERE (from_user_id=? AND to_user_id=?) OR (from_user_id=? AND to_user_id=?)`).get(req.user.id, c.id, c.id, req.user.id);
    return { ...c, connection_status: conn?.status || null, is_sender: conn?.from_user_id === req.user.id };
  });
  res.json(withStatus);
});

// Send connection request
router.post('/connect/:toId', authenticate, (req, res) => {
  if (!['consultant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Consultants only' });
  const toId = parseInt(req.params.toId);
  if (toId === req.user.id) return res.status(400).json({ error: 'Cannot connect with yourself' });
  const existing = db.prepare('SELECT id FROM b2b_connections WHERE (from_user_id=? AND to_user_id=?) OR (from_user_id=? AND to_user_id=?)').get(req.user.id, toId, toId, req.user.id);
  if (existing) return res.status(400).json({ error: 'Already exists' });
  db.prepare('INSERT INTO b2b_connections(from_user_id,to_user_id,message) VALUES(?,?,?)').run(req.user.id, toId, req.body.message || '');
  res.json({ success: true });
});

// Accept / reject
router.put('/connect/:fromId/:action', authenticate, (req, res) => {
  const conn = db.prepare('SELECT * FROM b2b_connections WHERE from_user_id=? AND to_user_id=?').get(req.params.fromId, req.user.id);
  if (!conn) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE b2b_connections SET status=? WHERE id=?').run(req.params.action === 'accept' ? 'accepted' : 'rejected', conn.id);
  res.json({ success: true });
});

// My connections
router.get('/connections', authenticate, (req, res) => {
  const rows = db.prepare(`
    SELECT bc.*,
      CASE WHEN bc.from_user_id=? THEN bc.to_user_id ELSE bc.from_user_id END as partner_id,
      u.name as partner_name, u.email as partner_email,
      (SELECT COUNT(*) FROM services WHERE consultant_id=u.id AND active=1) as partner_services
    FROM b2b_connections bc
    JOIN users u ON u.id = CASE WHEN bc.from_user_id=? THEN bc.to_user_id ELSE bc.from_user_id END
    WHERE (bc.from_user_id=? OR bc.to_user_id=?) AND bc.status='accepted'
  `).all(req.user.id, req.user.id, req.user.id, req.user.id);
  res.json(rows);
});

// Pending requests received
router.get('/requests', authenticate, (req, res) => {
  const reqs = db.prepare(`
    SELECT bc.*, u.name as from_name, u.email as from_email
    FROM b2b_connections bc JOIN users u ON bc.from_user_id=u.id
    WHERE bc.to_user_id=? AND bc.status='pending'
    ORDER BY bc.created_at DESC
  `).all(req.user.id);
  res.json(reqs);
});

// B2B Messages
router.get('/messages/:partnerId', authenticate, (req, res) => {
  const msgs = db.prepare(`
    SELECT bm.*, u.name as sender_name FROM b2b_messages bm JOIN users u ON bm.from_user_id=u.id
    WHERE (bm.from_user_id=? AND bm.to_user_id=?) OR (bm.from_user_id=? AND bm.to_user_id=?)
    ORDER BY bm.created_at ASC
  `).all(req.user.id, req.params.partnerId, req.params.partnerId, req.user.id);
  db.prepare('UPDATE b2b_messages SET read=1 WHERE to_user_id=? AND from_user_id=?').run(req.user.id, req.params.partnerId);
  res.json(msgs);
});

router.post('/messages/:partnerId', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message required' });
  const r = db.prepare('INSERT INTO b2b_messages(from_user_id,to_user_id,content) VALUES(?,?,?)').run(req.user.id, req.params.partnerId, content.trim());
  const msg = db.prepare('SELECT bm.*, u.name as sender_name FROM b2b_messages bm JOIN users u ON bm.from_user_id=u.id WHERE bm.id=?').get(r.lastInsertRowid);
  res.status(201).json(msg);
});

module.exports = router;
