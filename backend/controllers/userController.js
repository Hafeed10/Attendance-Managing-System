const { Student, Class, Subject } = require('../models');
const attendanceService = require('../services/attendanceService');
const reportService = require('../services/reportService');

// Get my dashboard (overall attendance percentage, subject-wise, monthly summary)
const getMyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find student profile linked to this user account
        const student = await Student.findOne({ where: { userId } });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found for this user.' });
        }

        const studentId = student.id;

        // 1. Overall attendance percentage
        const overallStats = await attendanceService.calculateAttendancePercentage(studentId);

        // 2. Defaulter warnings
        const defaulters = await attendanceService.getDefaulters();
        const isDefaulter = defaulters.find(d => d.studentId === studentId);

        // 3. Subject-wise attendance
        const subjectWise = await attendanceService.getSubjectWiseAttendance(studentId);

        res.json({
            studentId,
            name: student.name,
            overallPercentage: overallStats.percentage,
            status: isDefaulter ? isDefaulter.status : 'good',
            subjectWise
        });

    } catch (error) {
        console.error('Error fetching student dashboard:', error);
        res.status(500).json({ error: 'Server error while fetching dashboard' });
    }
};

// Get monthly summary
const getMyMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await Student.findOne({ where: { userId } });
        if (!student) return res.status(404).json({ error: 'Student profile not found' });

        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

        const summary = await attendanceService.getMonthlyAttendance(student.id, month, year);
        res.json({ summary });
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
        res.status(500).json({ error: 'Server error while fetching monthly summary' });
    }
};

// Generate and download my monthly report
const downloadMyMonthlyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await Student.findOne({ where: { userId } });
        if (!student) return res.status(404).json({ error: 'Student profile not found' });

        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

        const report = await reportService.generateStudentReport({
            studentId: student.id,
            month,
            year,
            generatedBy: userId
        });

        const filePath = reportService.getReportFilePath(report.filePath);
        res.download(filePath, report.filePath);

    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ error: 'Server error while downloading report' });
    }
};

module.exports = {
    getMyDashboard,
    getMyMonthlySummary,
    downloadMyMonthlyReport
};
