const prisma = require('../db');
const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../utils/token');

/**
 * Authentication Middleware (Mandatory)
 * Validates JWT access token from Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Sesi tidak ditemukan. Silakan login terlebih dahulu.', 401));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const error = new AppError('Sesi telah kedaluwarsa.', 401);
        error.code = 'TOKEN_EXPIRED';
        return next(error);
      }
      return next(new AppError('Token tidak valid. Silakan login kembali.', 401));
    }

    // Verify user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { mechanic: true },
    });

    if (!user) {
      return next(new AppError('Akun pengguna tidak ditemukan.', 401));
    }

    if (!user.is_active) {
      return next(
        new AppError('Akun Anda telah dinonaktifkan. Silakan hubungi Kepala Bengkel.', 403)
      );
    }

    req.user = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      mechanicId: user.mechanic?.id || null,
      mechanicName: user.mechanic?.nama || null,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * If Bearer token is provided and valid, attaches req.user without throwing 401
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          include: { mechanic: true },
        });

        if (user && user.is_active) {
          req.user = {
            id: user.id,
            username: user.username,
            nama: user.nama,
            role: user.role,
            mechanicId: user.mechanic?.id || null,
            mechanicName: user.mechanic?.nama || null,
          };
        }
      } catch {
        // Silent ignore in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

authMiddleware.optional = optionalAuthMiddleware;
authMiddleware.authMiddleware = authMiddleware;
authMiddleware.optionalAuthMiddleware = optionalAuthMiddleware;

module.exports = authMiddleware;
