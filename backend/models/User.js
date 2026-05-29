const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// The User model handles login accounts for all roles
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'faculty', 'parent'),
    allowNull: false,
    defaultValue: 'faculty',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
