const { AuditLog } = require('../models');

const buildChanges = (before = {}, after = {}) => {
  const diff = {};
  Object.keys(after).forEach((key) => {
    if (before[key] !== after[key]) {
      diff[key] = { before: before[key], after: after[key] };
    }
  });
  return Object.keys(diff).length ? diff : null;
};

const logAction = async ({ userId, action, entity, entityId = null, changes = null, ipAddress = null }) => {
  return AuditLog.create({ userId, action, entity, entityId, changes, ipAddress });
};

module.exports = { buildChanges, logAction };