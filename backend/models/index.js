const sequelize = require('../config/database');
const User = require('./User');
const Faculty = require('./Faculty');
const Student = require('./Student');

// Define Relationships
User.hasOne(Faculty, { foreignKey: 'userId', onDelete: 'CASCADE' });
Faculty.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Faculty,
  Student
};
