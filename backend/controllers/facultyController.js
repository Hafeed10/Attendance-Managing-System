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

// Edit attendance
const editAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const record = await Attendance.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    await record.update({ status, markedBy: req.user ? req.user.id : record.markedBy });
    res.json({ message: 'Attendance updated', record });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Server error while updating attendance' });
  }
};

// Delete attendance
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    await record.destroy();
    res.json({ message: 'Attendance removed' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Server error while deleting attendance' });
  }
};

// Get my classes
const getMyClasses = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const faculty = await Faculty.findOne({ where: { userId: facultyId } });
    if (!faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    res.json({
      assignedClasses: faculty.assignedClasses,
      assignedSubjects: faculty.assignedSubjects
    });
  } catch (error) {
    console.error('Error fetching my classes:', error);
    res.status(500).json({ error: 'Server error while fetching my classes' });
  }
};

// Get single student dashboard view
const getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const stats = await attendanceService.calculateAttendancePercentage(studentId);
    const subjectWise = await attendanceService.getSubjectWiseAttendance(studentId);
    const defaulters = await attendanceService.getDefaulters();
    const isDefaulter = defaulters.find(d => d.studentId == studentId);

    res.json({
      studentId,
      overallPercentage: stats.percentage,
      status: isDefaulter ? isDefaulter.status : 'good',
      subjectWise
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ error: 'Server error while fetching student dashboard' });
  }
};

// Export controllers
module.exports = { 
  markAttendance, 
  getAttendanceForDate, 
  editAttendance, 
  deleteAttendance, 
  getMyClasses, 
  getStudentDashboard 
};
