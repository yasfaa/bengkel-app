const AppError = require('../utils/appError');

/**
 * Role-Based Access Control Middleware
 * @param  {...string|string[]} roles - Allowed roles e.g. 'ADMIN', 'KEPALA_BENGKEL'
 */
const roleMiddleware = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Sesi tidak terautentikasi.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: [${allowedRoles.join(', ')}].`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
