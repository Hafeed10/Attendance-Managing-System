const express = require('express');
const router = express.Router();

// Import the logic from your controller
const { addFaculty, addStudent } = require('../controllers/adminController');

// Import authentication middleware
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Define the Admin endpoints (Protected by verifyToken and isAdmin)
router.post('/faculty', verifyToken, isAdmin, addFaculty);
router.post('/student', verifyToken, isAdmin, addStudent);

module.exports = router;