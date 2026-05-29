/**
 * Centralized error handling middleware.
 * 
 * - asyncHandler: wraps async route handlers to catch errors automatically
 * - errorHandler: global Express error handler — formats Sequelize and Joi errors
 */

// Wraps async controller functions so we don't need try/catch in every one
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler — mounted as the LAST middleware in server.js
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  // Sequelize validation errors (e.g. unique constraint, allowNull)
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: messages,
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map((d) => d.message),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Default: Internal server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, errorHandler };
