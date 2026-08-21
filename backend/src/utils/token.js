const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'bengkelku_access_secret_super_secure_key_123';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'bengkelku_refresh_secret_super_secure_key_456';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '5m';

/**
 * Generate a short-lived Access Token (JWT - 5 minutes)
 * @param {object} user - User payload { id, username, role, nama, mechanic_id }
 */
const generateAccessToken = (user) => {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama,
    mechanicId: user.mechanic?.id || user.mechanicId || null,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * Generate a secure cryptographically random Refresh Token string
 */
const generateRefreshTokenString = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify Access Token (JWT)
 * @param {string} token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Get cookie options for storing Refresh Token
 */
const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
};

module.exports = {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  generateAccessToken,
  generateRefreshTokenString,
  verifyAccessToken,
  getRefreshTokenCookieOptions,
};
