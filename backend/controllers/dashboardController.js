const { Student, Faculty, Attendance } = require('../models');
const attendanceService = require('../services/attendanceService');
const { Op } = require('sequelize');

// Get overall dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.count();
        const totalFaculty = await Faculty.count();

        // Get today's attendance percentage
        const today = new Date().toISOString().split('T')[0];
        const dailySummary = await attendanceService.getDailyAttendanceSummary(today);

        // Get total defaulters count across all classes
        const defaulters = await attendanceService.getDefaulters(null, 80);
        
        res.json({
            totalStudents,
            totalFaculty,
            todayAttendancePercentage: dailySummary.percentage,
            totalDefaulters: defaulters.length
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Server error while fetching dashboard stats' });
    }
};

// Get class-specific dashboard
const getClassDashboard = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date } = req.query; // optional specific date

        const today = date || new Date().toISOString().split('T')[0];
        
        // 1. Class attendance summary for today
        const dailySummary = await attendanceService.getDailyAttendanceSummary(today, classId);

        // 2. Absent students list for today
        const absentRecords = await Attendance.findAll({
            where: { classId, date: today, status: 'absent' },
            include: [{ model: Student, attributes: ['id', 'name', 'rollNumber'] }]
        });
        const absentStudents = absentRecords.map(record => record.Student);

        // 3. Subject-wise attendance summary for the class could be added here if needed

        res.json({
            date: today,
            dailySummary,
            absentStudents
        });
    } catch (error) {
        console.error('Error fetching class dashboard:', error);
        res.status(500).json({ error: 'Server error while fetching class dashboard' });
    }
};

// Get list of all defaulters
const getDefaultersList = async (req, res) => {
    try {
        const defaulters = await attendanceService.getDefaulters(null, 80);
        res.json({ defaulters });
    } catch (error) {
        console.error('Error fetching defaulters list:', error);
        res.status(500).json({ error: 'Server error while fetching defaulters list' });
    }
};

module.exports = {
    getDashboardStats,
    getClassDashboard,
    getDefaultersList
};
