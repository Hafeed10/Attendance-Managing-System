const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttendanceReport = sequelize.define('AttendanceReport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('daily', 'monthly', 'subject_wise', 'student_wise', 'defaulter', 'class_wise'),
    allowNull: false,
    comment: 'Type of report generated (PRD Section 12)',
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to users table — who generated this report',
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to the generated file on disk',
  },
  format: {
    type: DataTypes.ENUM('pdf', 'jpeg'),
    allowNull: false,
    defaultValue: 'pdf',
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON storing the filters used: classId, month, year, studentId, etc.',
  },
}, {
  tableName: 'attendance_reports',
  timestamps: true,
});

module.exports = AttendanceReport;
