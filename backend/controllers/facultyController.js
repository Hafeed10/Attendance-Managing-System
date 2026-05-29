const { Attendance } = require('../models');
const { validate } = require('../middleware/validate');
const attendanceService = require('../services/attendanceService');

// Mark attendance (bulk)
const markAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, records } = req.body;

    if (!classId || !subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare bulk records for upsert
    const bulk = records.map((r) => ({
      studentId: r.studentId,
      subjectId,
      facultyId: req.user && req.user.id ? req.user.id : null,
      classId,
      date,
      status: r.status,
      markedBy: req.user && req.user.id ? req.user.id : null,
    }));

    // Use bulkCreate with updateOnDuplicate to avoid duplicate entries per unique constraint
    await Attendance.bulkCreate(bulk, { updateOnDuplicate: ['status', 'markedBy', 'updatedAt'] });

    res.json({ message: 'Attendance marked' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Server error while marking attendance' });
  }
};

// Get attendance for a class on a date
const getAttendanceForDate = async (req, res) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) return res.status(400).json({ error: 'Missing classId or date' });

    const records = await Attendance.findAll({ where: { classId, date } });
    res.json({ records });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Server error while fetching attendance' });
  }
};

// Export controllers
module.exports = { markAttendance, getAttendanceForDate };
