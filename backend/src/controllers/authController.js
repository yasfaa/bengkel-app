const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { getRefreshTokenCookieOptions } = require('../utils/token');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);

  // Set httpOnly Refresh Token Cookie
  res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshTokenString = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refresh(refreshTokenString);

  // Rotate httpOnly Refresh Token Cookie
  res.cookie('refreshToken', result.newRefreshToken, getRefreshTokenCookieOptions());

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshTokenString = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.logout(refreshTokenString);

  // Clear httpOnly Cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    path: '/api/auth',
  });

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    path: '/api/auth',
  });

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

module.exports = {
  login,
  refresh,
  logout,
  getProfile,
  changePassword,
};
