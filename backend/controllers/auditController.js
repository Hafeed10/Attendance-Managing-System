const { AuditLog, User } = require('../models');

const listAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });
    res.json({ auditLogs: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Server error while fetching audit logs' });
  }
};

module.exports = { listAuditLogs };