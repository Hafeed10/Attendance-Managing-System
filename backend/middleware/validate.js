/**
 * Request validation middleware using Joi schemas.
 * 
 * Usage in routes:
 *   const { validate, schemas } = require('../middleware/validate');
 *   router.post('/faculty', validate(schemas.createFaculty), controller.addFaculty);
 */
const Joi = require('joi');

// Validation middleware factory — takes a Joi schema and returns middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // Return all errors, not just the first
    stripUnknown: true,   // Remove unknown fields
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map((d) => d.message),
    });
  }

  req.body = value; // Use the sanitized/validated body
  next();
};

// ─── Validation Schemas ──────────────────────────────────────────

const schemas = {
  // Auth
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  // Faculty
  createFaculty: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).allow(null, ''),
    assignedSubjects: Joi.array().items(Joi.number().integer()).default([]),
    assignedClasses: Joi.array().items(Joi.number().integer()).default([]),
  }),

  updateFaculty: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).allow(null, ''),
    assignedSubjects: Joi.array().items(Joi.number().integer()),
    assignedClasses: Joi.array().items(Joi.number().integer()),
    isActive: Joi.boolean(),
  }).min(1), // At least one field must be provided

  // Student
  createStudent: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    classId: Joi.number().integer().required(),
    division: Joi.string().trim().required(),
    rollNumber: Joi.string().trim().required(),
    parentContact: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).allow(null, ''),
    password: Joi.string().min(6).allow(null, ''), // Optional — if provided, creates User account
  }),

  updateStudent: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    classId: Joi.number().integer(),
    division: Joi.string().trim(),
    rollNumber: Joi.string().trim(),
    parentContact: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).allow(null, ''),
  }).min(1),

  // Class
  createClass: Joi.object({
    name: Joi.string().trim().required(),
    section: Joi.string().trim().allow(null, ''),
    academicYear: Joi.string().trim().required(),
  }),

  updateClass: Joi.object({
    name: Joi.string().trim(),
    section: Joi.string().trim().allow(null, ''),
    academicYear: Joi.string().trim(),
  }).min(1),

  // Subject
  createSubject: Joi.object({
    name: Joi.string().trim().required(),
    code: Joi.string().trim().allow(null, ''),
    classId: Joi.number().integer().required(),
  }),

  updateSubject: Joi.object({
    name: Joi.string().trim(),
    code: Joi.string().trim().allow(null, ''),
    classId: Joi.number().integer(),
  }).min(1),

  // Attendance
  markAttendance: Joi.object({
    classId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().required(),
    date: Joi.date().iso().required(),
    records: Joi.array().items(
      Joi.object({
        studentId: Joi.number().integer().required(),
        status: Joi.string().valid('present', 'absent', 'late').required(),
      })
    ).min(1).required(),
  }),

  // Temporary Access
  assignTemporaryAccess: Joi.object({
    originalFacultyId: Joi.number().integer().required(),
    replacementFacultyId: Joi.number().integer().required(),
    classId: Joi.number().integer().required(),
    subjectId: Joi.number().integer().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    reason: Joi.string().trim().allow(null, ''),
  }),

  updateTemporaryAccess: Joi.object({
    originalFacultyId: Joi.number().integer(),
    replacementFacultyId: Joi.number().integer(),
    classId: Joi.number().integer(),
    subjectId: Joi.number().integer(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    reason: Joi.string().trim().allow(null, ''),
    isActive: Joi.boolean(),
  }).min(1),

  // Reports
  generateClassReport: Joi.object({
    classId: Joi.number().integer().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).required(),
  }),

  generateStudentReport: Joi.object({
    studentId: Joi.number().integer().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).required(),
  }),

  generateDefaulterReport: Joi.object({
    classId: Joi.number().integer().optional(),
  }),
};

module.exports = { validate, schemas };
