const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TemporaryAccess = sequelize.define('TemporaryAccess', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  originalFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to faculties — the absent faculty member',
  },
  replacementFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to faculties — the temporary replacement',
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to classes — which class access is granted for',
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to subjects — subject-specific access (PRD 4.1.6)',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Access expires automatically after this date',
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Can be manually revoked by admin',
  },
}, {
  tableName: 'temporary_access',
  timestamps: true,
});

module.exports = TemporaryAccess;
