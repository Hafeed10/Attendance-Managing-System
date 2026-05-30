const express = require('express');
const router = express.Router();
const { verifyToken, isFaculty } = require('../middleware/authMiddleware');
const { 
  markAttendance, 
  getAttendanceForDate,
  editAttendance,
  deleteAttendance,
  getMyClasses,
  getStudentDashboard
} = require('../controllers/facultyController');

// Faculty marks attendance
router.post('/attendance', verifyToken, isFaculty, markAttendance);

// Get attendance for a class on a date (faculty/admin)
router.get('/attendance', verifyToken, isFaculty, getAttendanceForDate);

// Edit attendance
router.put('/attendance/:id', verifyToken, isFaculty, editAttendance);

// Delete attendance
router.delete('/attendance/:id', verifyToken, isFaculty, deleteAttendance);

// Get my assigned classes and subjects
router.get('/my-classes', verifyToken, isFaculty, getMyClasses);

// Single student dashboard view
router.get('/student-dashboard/:studentId', verifyToken, isFaculty, getStudentDashboard);

module.exports = router;
