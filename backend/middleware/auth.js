const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'ava_secret';

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Administrator access required' });
  next();
};

const isStaff = (req, res, next) => {
  if (!['admin', 'consultant'].includes(req.user?.role))
    return res.status(403).json({ error: 'Staff access required' });
  next();
};

module.exports = { authenticate, isAdmin, isStaff };
