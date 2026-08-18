/**
 * Centralized Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server.';

  // Handle Prisma Database Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Data sudah terdaftar atau terdapat duplikasi data unik.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Data yang diminta tidak ditemukan.';
  }

  // Log non-operational errors or full errors in development
  if (process.env.NODE_ENV === 'development' || !err.isOperational) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const responsePayload = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    error: message,
    message,
  };

  if (err.details) {
    responsePayload.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
