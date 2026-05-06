const permissions = require('../config/permissions');
const AppError = require('../error/AppError');

function authorizePermissions(requiredPermissions = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return next(new AppError('Missing user role.', 401, 'MISSING_ROLE'));
    }
    const allowed = permissions[role] || [];
    const hasPermission = requiredPermissions.every((permission) => allowed.includes(permission));
    if (!hasPermission) {
      return next(new AppError('Insufficient permissions.', 403, 'FORBIDDEN'));
    }
    next();
  };
}

module.exports = { authorizePermissions };
