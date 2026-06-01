const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignedSubjects: {
    type: DataTypes.JSON, // Stores array of subject IDs
    allowNull: true,
    defaultValue: [],
  },
  assignedClasses: {
    type: DataTypes.JSON, // Stores array of class IDs (PRD 4.1.3)
    allowNull: true,
    defaultValue: [],
  },
  isTemporary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if this faculty currently has temporary access assignments',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to users table',
  },
}, {
  tableName: 'faculties',
  timestamps: true,
});

module.exports = Faculty;
