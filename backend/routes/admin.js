const express = require('express');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/stats', (req, res) => {
  const g = (sql) => db.prepare(sql).get().count;

  res.json({
    users:               g("SELECT COUNT(*) as count FROM users WHERE role='user'"),
    applications:        g("SELECT COUNT(*) as count FROM applications"),
    pendingApplications: g("SELECT COUNT(*) as count FROM applications WHERE status='pending'"),
    approvedApplications:g("SELECT COUNT(*) as count FROM applications WHERE status='approved'"),
    rejectedApplications:g("SELECT COUNT(*) as count FROM applications WHERE status='rejected'"),
    documents:           g("SELECT COUNT(*) as count FROM documents"),
    pendingDocuments:    g("SELECT COUNT(*) as count FROM documents WHERE status='pending'"),
    verifiedDocuments:   g("SELECT COUNT(*) as count FROM documents WHERE status='approved'"),
    programs:            g("SELECT COUNT(*) as count FROM visa_programs WHERE active=1"),
    assessments:         g("SELECT COUNT(*) as count FROM assessments"),

    recentApplications: db.prepare(`
      SELECT a.*, u.name as user_name, vp.name as program_name, vp.country
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN visa_programs vp ON a.program_id = vp.id
      ORDER BY a.submitted_at DESC LIMIT 8
    `).all(),

    recentUsers: db.prepare(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
    ).all(),
  });
});

router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.nationality, u.created_at,
      (SELECT COUNT(*) FROM applications WHERE user_id = u.id) as application_count,
      (SELECT COUNT(*) FROM documents WHERE user_id = u.id) as document_count,
      (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count
    FROM users u ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });

  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id=?').get(req.params.id);
  res.json(user);
});

router.delete('/users/:id', (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account' });

  db.prepare('DELETE FROM applications WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM documents WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM learning_progress WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM assessments WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

// Student progress report - full picture per student
router.get('/progress-report', (req, res) => {
  const students = db.prepare("SELECT id,name,email,nationality,phone,last_seen,current_page,created_at FROM users WHERE role='user' ORDER BY created_at DESC").all();

  const report = students.map(s => {
    const apps     = db.prepare("SELECT a.*,vp.name as program_name,vp.country FROM applications a JOIN visa_programs vp ON a.program_id=vp.id WHERE a.user_id=?").all(s.id);
    const docs     = db.prepare("SELECT type,status FROM documents WHERE user_id=?").all(s.id);
    const progress = db.prepare("SELECT lp.*,lm.title FROM learning_progress lp JOIN learning_modules lm ON lp.module_id=lm.id WHERE lp.user_id=?").all(s.id);
    const assess   = db.prepare("SELECT score,result,created_at FROM assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1").get(s.id);
    const totalModules = db.prepare("SELECT COUNT(*) as c FROM learning_modules WHERE active=1").get().c;

    return {
      ...s,
      application_count:  apps.length,
      pending_apps:       apps.filter(a=>a.status==='pending').length,
      approved_apps:      apps.filter(a=>a.status==='approved').length,
      applications:       apps,
      doc_count:          docs.length,
      verified_docs:      docs.filter(d=>d.status==='approved').length,
      pending_docs:       docs.filter(d=>d.status==='pending').length,
      modules_completed:  progress.filter(p=>p.completed).length,
      modules_total:      totalModules,
      learning_pct:       totalModules ? Math.round((progress.filter(p=>p.completed).length/totalModules)*100) : 0,
      latest_score:       assess?.score || null,
      latest_result:      assess?.result || null,
      last_assessed:      assess?.created_at || null,
    };
  });

  res.json(report);
});
