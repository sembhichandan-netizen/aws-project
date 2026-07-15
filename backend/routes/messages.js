const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get all threads for current user (admin/consultant sees all)
router.get('/threads', authenticate, (req, res) => {
  let threads;
  if (req.user.role === 'admin' || req.user.role === 'consultant') {
    // See all student threads grouped by student
    threads = db.prepare(`
      SELECT 
        m.thread_id,
        u.id as student_id, u.name as student_name, u.email as student_email,
        u.nationality,
        (SELECT content FROM messages WHERE thread_id = m.thread_id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE thread_id = m.thread_id ORDER BY created_at DESC LIMIT 1) as last_at,
        (SELECT COUNT(*) FROM messages WHERE thread_id = m.thread_id AND read_by_recipient = 0 AND from_user_id != ?) as unread_count
      FROM messages m
      JOIN users u ON u.id = CAST(SUBSTR(m.thread_id, INSTR(m.thread_id, '_') + 1) AS INTEGER)
      WHERE m.thread_id LIKE 'student_%'
      GROUP BY m.thread_id
      ORDER BY last_at DESC
    `).all(req.user.id);
  } else {
    // Student sees only their own thread
    const threadId = `student_${req.user.id}`;
    const last = db.prepare(`SELECT content, created_at FROM messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1`).get(threadId);
    const unread = db.prepare(`SELECT COUNT(*) as c FROM messages WHERE thread_id = ? AND read_by_recipient = 0 AND from_user_id != ?`).get(threadId, req.user.id);
    threads = last ? [{ thread_id: threadId, last_message: last.content, last_at: last.created_at, unread_count: unread.c }] : [];
  }
  res.json(threads);
});

// Get messages in a thread
router.get('/:threadId', authenticate, (req, res) => {
  const { threadId } = req.params;
  
  // Security: students can only see their own thread
  if (req.user.role === 'user') {
    const expected = `student_${req.user.id}`;
    if (threadId !== expected) return res.status(403).json({ error: 'Not authorized' });
  }

  const msgs = db.prepare(`
    SELECT m.*, u.name as sender_name, u.role as sender_role
    FROM messages m
    JOIN users u ON m.from_user_id = u.id
    WHERE m.thread_id = ?
    ORDER BY m.created_at ASC
  `).all(threadId);

  // Mark as read for the current user
  db.prepare(`
    UPDATE messages SET read_by_recipient = 1
    WHERE thread_id = ? AND from_user_id != ?
  `).run(threadId, req.user.id);

  res.json(msgs);
});

// Send a message
router.post('/', authenticate, (req, res) => {
  const { content, thread_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

  // Student always writes to their own thread
  const threadId = req.user.role === 'user'
    ? `student_${req.user.id}`
    : thread_id;

  if (!threadId) return res.status(400).json({ error: 'thread_id required' });

  const r = db.prepare(`
    INSERT INTO messages(from_user_id, thread_id, content)
    VALUES(?, ?, ?)
  `).run(req.user.id, threadId, content.trim());

  // Log activity for students
  if (req.user.role === 'user') {
    db.prepare(`INSERT INTO activity_log(user_id, action, detail) VALUES(?,?,?)`)
      .run(req.user.id, 'message_sent', 'Sent message to consultant');
  }

  const msg = db.prepare(`
    SELECT m.*, u.name as sender_name, u.role as sender_role
    FROM messages m JOIN users u ON m.from_user_id = u.id
    WHERE m.id = ?
  `).get(r.lastInsertRowid);

  res.status(201).json(msg);
});

// Unread count for current user
router.get('/unread/count', authenticate, (req, res) => {
  let count;
  if (req.user.role === 'user') {
    count = db.prepare(`
      SELECT COUNT(*) as c FROM messages
      WHERE thread_id = ? AND read_by_recipient = 0 AND from_user_id != ?
    `).get(`student_${req.user.id}`, req.user.id);
  } else {
    count = db.prepare(`
      SELECT COUNT(*) as c FROM messages
      WHERE read_by_recipient = 0 AND from_user_id != ?
    `).get(req.user.id);
  }
  res.json({ unread: count.c });
});

module.exports = router;
