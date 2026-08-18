const AppError = require('../utils/appError');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Rute ${req.method} ${req.originalUrl} tidak ditemukan.`, 404));
};

module.exports = notFoundHandler;
