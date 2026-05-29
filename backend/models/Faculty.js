const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

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
    type: DataTypes.JSON, // Stores array of subject IDs or names
    allowNull: true,
    defaultValue: []
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'faculties',
  timestamps: true,
});

module.exports = Faculty;
