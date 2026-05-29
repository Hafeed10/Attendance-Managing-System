const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "10th Standard", "12th Science"',
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g. "A", "B", "C"',
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "2025-2026"',
  },
}, {
  tableName: 'classes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'section', 'academicYear'],
    },
  ],
});

module.exports = Class;
