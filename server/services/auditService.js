const prisma = require('../config/prisma');

async function logAction(userId, action, details = '') {
  await prisma.auditLog.create({ data: { userId, action, details } });
}

module.exports = { logAction };
