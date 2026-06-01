const express = require('express');
const router = express.Router();
const { verifyToken, isStudentOrParent } = require('../middleware/authMiddleware');
const { 
  getMyDashboard, 
  getMyMonthlySummary, 
  downloadMyMonthlyReport 
} = require('../controllers/userController');

// User Dashboard
router.get('/dashboard', verifyToken, isStudentOrParent, getMyDashboard);

// User Monthly Summary
router.get('/monthly-summary', verifyToken, isStudentOrParent, getMyMonthlySummary);

// User Download Report
router.get('/download-report', verifyToken, isStudentOrParent, downloadMyMonthlyReport);

module.exports = router;
