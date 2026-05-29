const express = require('express');
const router = express.Router();

// Import the logic from your controller
const {
	addFaculty,
	listFaculties,
	getFaculty,
	updateFaculty,
	deleteFaculty,
	addStudent,
	listStudents,
	getStudent,
	updateStudent,
	deleteStudent,
} = require('../controllers/adminController');
const {
	createClass,
	listClasses,
	getClassById,
	updateClass,
	deleteClass,
} = require('../controllers/classController');
const {
	createSubject,
	listSubjects,
	getSubject,
	updateSubject,
	deleteSubject,
} = require('../controllers/subjectController');
const {
	assignTemporaryAccess,
	listTemporaryAccess,
	getTemporaryAccess,
	updateTemporaryAccess,
	revokeTemporaryAccess,
} = require('../controllers/temporaryAccessController');
const { listAuditLogs } = require('../controllers/auditController');
const {
	generateClassReport,
	generateStudentReport,
	generateDefaulterReport,
	listReports,
	downloadReport,
} = require('../controllers/reportController');
const { validate, schemas } = require('../middleware/validate');

// Import authentication middleware
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Define the Admin endpoints (Protected by verifyToken and isAdmin)
// Faculty
router.post('/faculty', verifyToken, isAdmin, validate(schemas.createFaculty), addFaculty);
router.get('/faculty', verifyToken, isAdmin, listFaculties);
router.get('/faculty/:id', verifyToken, isAdmin, getFaculty);
router.put('/faculty/:id', verifyToken, isAdmin, validate(schemas.updateFaculty), updateFaculty);
router.delete('/faculty/:id', verifyToken, isAdmin, deleteFaculty);

// Student
router.post('/student', verifyToken, isAdmin, validate(schemas.createStudent), addStudent);
router.get('/student', verifyToken, isAdmin, listStudents);
router.get('/student/:id', verifyToken, isAdmin, getStudent);
router.put('/student/:id', verifyToken, isAdmin, validate(schemas.updateStudent), updateStudent);
router.delete('/student/:id', verifyToken, isAdmin, deleteStudent);

// Class management
router.post('/class', verifyToken, isAdmin, validate(schemas.createClass), createClass);
router.get('/class', verifyToken, isAdmin, listClasses);
router.get('/class/:id', verifyToken, isAdmin, getClassById);
router.put('/class/:id', verifyToken, isAdmin, validate(schemas.updateClass), updateClass);
router.delete('/class/:id', verifyToken, isAdmin, deleteClass);

// Subject management
router.post('/subject', verifyToken, isAdmin, validate(schemas.createSubject), createSubject);
router.get('/subject', verifyToken, isAdmin, listSubjects);
router.get('/subject/:id', verifyToken, isAdmin, getSubject);
router.put('/subject/:id', verifyToken, isAdmin, validate(schemas.updateSubject), updateSubject);
router.delete('/subject/:id', verifyToken, isAdmin, deleteSubject);

// Temporary access management
router.post('/temporary-access', verifyToken, isAdmin, validate(schemas.assignTemporaryAccess), assignTemporaryAccess);
router.get('/temporary-access', verifyToken, isAdmin, listTemporaryAccess);
router.get('/temporary-access/:id', verifyToken, isAdmin, getTemporaryAccess);
router.put('/temporary-access/:id', verifyToken, isAdmin, validate(schemas.updateTemporaryAccess), updateTemporaryAccess);
router.delete('/temporary-access/:id', verifyToken, isAdmin, revokeTemporaryAccess);

// Audit logs
router.get('/audit-logs', verifyToken, isAdmin, listAuditLogs);

// Report generation
router.post('/reports/class-monthly', verifyToken, isAdmin, validate(schemas.generateClassReport), generateClassReport);
router.post('/reports/student-monthly', verifyToken, isAdmin, validate(schemas.generateStudentReport), generateStudentReport);
router.post('/reports/defaulters', verifyToken, isAdmin, validate(schemas.generateDefaulterReport), generateDefaulterReport);
router.get('/reports', verifyToken, isAdmin, listReports);
router.get('/reports/download/:fileName', verifyToken, isAdmin, downloadReport);

module.exports = router;