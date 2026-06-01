const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_attendance_key';

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Requires admin privileges.' });
  }
  next();
};

// Middleware to check if the user is faculty (or admin, since admin can do everything)
const isFaculty = (req, res, next) => {
  if (!req.user || (req.user.role !== 'faculty' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Requires faculty privileges.' });
  }
  next();
};

// Middleware to check if the user is a student or parent
const isStudentOrParent = (req, res, next) => {
  const allowed = ['student', 'parent', 'admin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Requires student or parent privileges.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isFaculty,
  isStudentOrParent,
};