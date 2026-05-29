const express = require('express');
const router = express.Router();
const { verifyToken, isFaculty } = require('../middleware/authMiddleware');
const { markAttendance, getAttendanceForDate } = require('../controllers/facultyController');

// Faculty marks attendance
router.post('/attendance', verifyToken, isFaculty, markAttendance);

// Get attendance for a class on a date (faculty/admin)
router.get('/attendance', verifyToken, isFaculty, getAttendanceForDate);

module.exports = router;
