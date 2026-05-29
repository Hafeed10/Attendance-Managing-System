const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to users — who performed the action',
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "CREATE", "UPDATE", "DELETE", "LOGIN", "MARK_ATTENDANCE"',
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. "Faculty", "Student", "Attendance", "TemporaryAccess"',
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the affected entity row',
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON diff of old vs new values for UPDATE actions',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false, // Audit logs are immutable — only createdAt matters
});

module.exports = AuditLog;
