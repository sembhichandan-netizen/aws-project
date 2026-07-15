const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/questions', (req, res) => {
  const questions = db.prepare('SELECT * FROM eligibility_questions ORDER BY order_num').all();
  res.json(questions.map(q => ({ ...q, options: q.options ? JSON.parse(q.options) : null })));
});

router.post('/assess', authenticate, (req, res) => {
  const { answers, program_id } = req.body;
  let score = 0;

  // Age scoring (max 20)
  const age = parseInt(answers.age) || 0;
  if (age >= 18 && age <= 29) score += 20;
  else if (age <= 35) score += 16;
  else if (age <= 40) score += 10;
  else if (age <= 45) score += 5;

  // Education (max 20)
  const eduMap = { 'PhD': 20, "Master's Degree": 18, "Bachelor's Degree": 15, 'Diploma': 10, 'High School': 5 };
  score += eduMap[answers.education] || 0;

  // Work experience (max 20)
  const exp = parseInt(answers.experience) || 0;
  if (exp >= 6) score += 20;
  else if (exp >= 4) score += 15;
  else if (exp >= 2) score += 10;
  else if (exp >= 1) score += 5;

  // Language score (max 25)
  const lang = parseFloat(answers.language_score) || 0;
  if (lang >= 8.0) score += 25;
  else if (lang >= 7.0) score += 20;
  else if (lang >= 6.5) score += 15;
  else if (lang >= 6.0) score += 10;
  else if (lang >= 5.0) score += 5;

  // Financial (max 10)
  if (answers.financial?.includes('Above')) score += 10;
  else if (answers.financial?.includes('20,000')) score += 6;
  else if (answers.financial?.includes('5,000')) score += 3;

  // Relatives abroad (max 5)
  if (answers.relatives && answers.relatives !== 'No') score += 5;

  const capped = Math.min(score, 100);
  const result = capped >= 70 ? 'High Eligibility' : capped >= 50 ? 'Moderate Eligibility' : 'Low Eligibility';

  const ins = db.prepare(
    'INSERT INTO assessments (user_id, program_id, score, result, answers) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, program_id || null, capped, result, JSON.stringify(answers));

  res.json({ score: capped, result, maxScore: 100, assessment_id: ins.lastInsertRowid });
});

router.get('/history', authenticate, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, vp.name as program_name
    FROM assessments a
    LEFT JOIN visa_programs vp ON a.program_id = vp.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

module.exports = router;
