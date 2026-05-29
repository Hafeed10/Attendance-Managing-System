const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to students table',
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to subjects table — enables subject-wise attendance (FR-9)',
  },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to faculties table — who marked this attendance',
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to classes table',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'The date of the attendance record',
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false,
    defaultValue: 'present',
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'userId of who actually marked (useful for temporary faculty audit)',
  },
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [
    {
      // Prevent duplicate attendance: one student, one subject, one date
      unique: true,
      fields: ['studentId', 'subjectId', 'date'],
    },
    {
      fields: ['classId', 'date'],
    },
    {
      fields: ['studentId'],
    },
  ],
});

module.exports = Attendance;
