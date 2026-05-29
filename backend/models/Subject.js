const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "Mathematics", "Physics"',
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'e.g. "MATH101", "PHY201"',
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to classes table',
  },
}, {
  tableName: 'subjects',
  timestamps: true,
});

module.exports = Subject;
