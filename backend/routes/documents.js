const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    const docs = db.prepare(`
      SELECT d.*, u.name as user_name, u.email as user_email
      FROM documents d JOIN users u ON d.user_id = u.id
      ORDER BY d.uploaded_at DESC
    `).all();
    return res.json(docs);
  }
  res.json(db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.user.id));
});

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const result = db.prepare(
    'INSERT INTO documents (user_id, type, filename, original_name) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, req.body.type || 'Other', req.file.filename, req.file.originalname);

  res.status(201).json(db.prepare('SELECT * FROM documents WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id/verify', authenticate, isAdmin, (req, res) => {
  const { status, notes } = req.body;
  db.prepare(
    'UPDATE documents SET status=?, notes=?, verified_by=?, verified_at=? WHERE id=?'
  ).run(status, notes || null, req.user.id, new Date().toISOString(), req.params.id);

  res.json(db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticate, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not authorized' });

  const fp = path.join(uploadsDir, doc.filename);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

// Document readiness: per-program checklist status
const REQUIRED_DOCS = {
  default: ['Passport','Police Clearance','Medical Examination','Birth Certificate','Passport Photographs'],
  Canada:  ['Passport','IELTS/PTE Score Card','Educational Certificates','Work Experience Letter','Police Clearance','Bank Statement','Medical Examination','Birth Certificate'],
  Australia:['Passport','IELTS/PTE Score Card','Educational Certificates','Skills Assessment','Police Clearance','Medical Examination','Bank Statement'],
  'United Kingdom':['Passport','IELTS/PTE Score Card','Work Experience Letter','Bank Statement','Police Clearance'],
  Germany: ['Passport','Educational Certificates','Work Experience Letter','Bank Statement','Police Clearance'],
};

const express2 = require('express');
// Attach to existing router (already required above)
router.get('/readiness/:country', authenticate, (req, res) => {
  const country = decodeURIComponent(req.params.country);
  const required = REQUIRED_DOCS[country] || REQUIRED_DOCS.default;
  const uploaded = db.prepare('SELECT * FROM documents WHERE user_id=?').all(req.user.id);

  const checklist = required.map(docType => {
    const found = uploaded.find(d => d.type === docType);
    return {
      type: docType,
      uploaded: !!found,
      status: found?.status || null,
      filename: found?.original_name || null,
    };
  });

  const uploaded_count  = checklist.filter(c => c.uploaded).length;
  const verified_count  = checklist.filter(c => c.status === 'approved').length;
  const readiness_pct   = Math.round((verified_count / required.length) * 100);

  res.json({ country, checklist, total: required.length, uploaded: uploaded_count, verified: verified_count, readiness_pct });
});
