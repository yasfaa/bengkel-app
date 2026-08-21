const bcrypt = require('bcryptjs');
const prisma = require('../db');
const AppError = require('../utils/appError');
const { generateAccessToken, generateRefreshTokenString } = require('../utils/token');

class AuthService {
  /**
   * Authenticate user credentials and issue Access & Refresh tokens
   */
  async login(username, password) {
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim() },
      include: { mechanic: true },
    });

    if (!user) {
      throw new AppError('Username atau password yang Anda masukkan salah.', 401);
    }

    if (!user.is_active) {
      throw new AppError('Akun Anda dinonaktifkan. Silakan hubungi Kepala Bengkel.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Username atau password yang Anda masukkan salah.', 401);
    }

    // Generate short-lived Access Token (5m)
    const accessToken = generateAccessToken(user);

    // Generate and persist long-lived Refresh Token (7 days)
    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        user_id: user.id,
        expires_at: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        email: user.email,
        role: user.role,
        mechanicId: user.mechanic?.id || null,
        mechanicName: user.mechanic?.nama || null,
      },
    };
  }

  /**
   * Rotate refresh token and issue a fresh 5-minute access token
   */
  async refresh(refreshTokenString) {
    if (!refreshTokenString) {
      throw new AppError('Refresh token tidak ditemukan.', 401);
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: {
        user: {
          include: { mechanic: true },
        },
      },
    });

    if (!savedToken) {
      throw new AppError('Sesi tidak valid atau telah dicabut. Silakan login kembali.', 401);
    }

    // Check expiration
    if (new Date() > new Date(savedToken.expires_at)) {
      await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      throw new AppError('Sesi telah kedaluwarsa. Silakan login kembali.', 401);
    }

    if (!savedToken.user.is_active) {
      await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      throw new AppError('Akun pengguna telah dinonaktifkan.', 403);
    }

    // Token Rotation: Invalidate old refresh token and generate a new one
    const newRefreshTokenString = generateRefreshTokenString();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: savedToken.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshTokenString,
          user_id: savedToken.user.id,
          expires_at: newExpiresAt,
        },
      }),
    ]);

    const newAccessToken = generateAccessToken(savedToken.user);

    return {
      accessToken: newAccessToken,
      newRefreshToken: newRefreshTokenString,
      user: {
        id: savedToken.user.id,
        username: savedToken.user.username,
        nama: savedToken.user.nama,
        email: savedToken.user.email,
        role: savedToken.user.role,
        mechanicId: savedToken.user.mechanic?.id || null,
        mechanicName: savedToken.user.mechanic?.nama || null,
      },
    };
  }

  /**
   * Invalidate refresh token upon logout
   */
  async logout(refreshTokenString) {
    if (refreshTokenString) {
      try {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshTokenString },
        });
      } catch {
        // Silent ignore if token not found
      }
    }
    return { success: true, message: 'Logout berhasil.' };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mechanic: true },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan.', 404);
    }

    return {
      id: user.id,
      username: user.username,
      nama: user.nama,
      email: user.email,
      role: user.role,
      mechanicId: user.mechanic?.id || null,
      mechanicName: user.mechanic?.nama || null,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  /**
   * Change current user's password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan.', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new AppError('Password lama yang Anda masukkan salah.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and revoke all active refresh tokens for security
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      }),
    ]);

    return { success: true, message: 'Password berhasil diubah. Silakan login kembali.' };
  }
}

module.exports = new AuthService();
