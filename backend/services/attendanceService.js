/**
 * Attendance calculation service.
 * 
 * Contains all business logic for attendance percentage calculations,
 * defaulter detection, and subject-wise analytics (FR-4, FR-5, FR-9).
 */
const { Op, fn, col, literal } = require('sequelize');
const { Attendance, Student, Subject, Class } = require('../models');

/**
 * Calculate attendance percentage for a student.
 * @param {number} studentId
 * @param {number|null} subjectId - optional, for subject-wise percentage
 * @returns {Promise<{total: number, present: number, percentage: number}>}
 */
const calculateAttendancePercentage = async (studentId, subjectId = null) => {
  const where = { studentId };
  if (subjectId) where.subjectId = subjectId;

  const total = await Attendance.count({ where });
  const present = await Attendance.count({
    where: { ...where, status: { [Op.in]: ['present', 'late'] } },
  });

  const percentage = total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0;
  return { total, present, percentage };
};

/**
 * Get students below the minimum attendance threshold (FR-5).
 * @param {number|null} classId - optional, filter by class
 * @param {number} threshold - default 80
 * @returns {Promise<Array>} - list of defaulter students with their percentages
 */
const getDefaulters = async (classId = null, threshold = 80) => {
  const studentWhere = {};
  if (classId) studentWhere.classId = classId;

  const students = await Student.findAll({
    where: studentWhere,
    include: [{ model: Class, attributes: ['name', 'section'] }],
  });

  const defaulters = [];
  for (const student of students) {
    const { percentage, total, present } = await calculateAttendancePercentage(student.id);
    if (total > 0 && percentage < threshold) {
      const status = percentage < 60 ? 'defaulter' : 'warning';
      defaulters.push({
        studentId: student.id,
        name: student.name,
        class: student.Class,
        rollNumber: student.rollNumber,
        division: student.division,
        total,
        present,
        percentage,
        status,
      });
    }
  }

  return defaulters.sort((a, b) => a.percentage - b.percentage);
};

/**
 * Get subject-wise attendance breakdown for a student (PRD 5.3, 5.4).
 * @param {number} studentId
 * @returns {Promise<Array>}
 */
const getSubjectWiseAttendance = async (studentId) => {
  // Get all subjects this student has attendance records for
  const subjectIds = await Attendance.findAll({
    where: { studentId },
    attributes: [[fn('DISTINCT', col('subjectId')), 'subjectId']],
    raw: true,
  });

  const results = [];
  for (const { subjectId } of subjectIds) {
    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, attributes: ['name', 'section'] }],
    });
    const stats = await calculateAttendancePercentage(studentId, subjectId);
    results.push({
      subject: subject ? { id: subject.id, name: subject.name, code: subject.code } : null,
      class: subject ? subject.Class : null,
      ...stats,
    });
  }

  return results;
};

/**
 * Get monthly attendance for a student (PRD 5.4, 6.2).
 * @param {number} studentId
 * @param {number} month - 1-12
 * @param {number} year
 * @returns {Promise<Object>}
 */
const getMonthlyAttendance = async (studentId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const where = {
    studentId,
    date: { [Op.between]: [startDate, endDate] },
  };

  const total = await Attendance.count({ where });
  const present = await Attendance.count({
    where: { ...where, status: { [Op.in]: ['present', 'late'] } },
  });
  const absent = await Attendance.count({
    where: { ...where, status: 'absent' },
  });
  const late = await Attendance.count({
    where: { ...where, status: 'late' },
  });

  const percentage = total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0;

  // Day-by-day breakdown
  const records = await Attendance.findAll({
    where,
    include: [{ model: Subject, attributes: ['name', 'code'] }],
    order: [['date', 'ASC']],
  });

  return {
    month,
    year,
    total,
    present,
    absent,
    late,
    percentage,
    records,
  };
};

/**
 * Get daily attendance summary for a class (PRD 4.1.1).
 * @param {string} date - YYYY-MM-DD
 * @param {number|null} classId
 * @returns {Promise<Object>}
 */
const getDailyAttendanceSummary = async (date, classId = null) => {
  const where = { date };
  if (classId) where.classId = classId;

  const total = await Attendance.count({ where });
  const present = await Attendance.count({
    where: { ...where, status: { [Op.in]: ['present', 'late'] } },
  });
  const absent = await Attendance.count({
    where: { ...where, status: 'absent' },
  });

  const percentage = total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0;

  return { date, total, present, absent, percentage };
};

module.exports = {
  calculateAttendancePercentage,
  getDefaulters,
  getSubjectWiseAttendance,
  getMonthlyAttendance,
  getDailyAttendanceSummary,
};
