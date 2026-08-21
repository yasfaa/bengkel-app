const bcrypt = require('bcryptjs');
const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId } = require('../utils/formatters');

class UserService {
  /**
   * Get all registered user accounts
   */
  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        mechanic: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      nama: u.nama,
      email: u.email,
      role: u.role,
      mechanicId: u.mechanic?.id || null,
      mechanicName: u.mechanic?.nama || null,
      isActive: u.is_active,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));
  }

  /**
   * Create a new user account (Only Kepala Bengkel)
   */
  async createUser(payload) {
    const { username, password, nama, email, role, mechanicId } = payload;
    const cleanUsername = String(username).trim();

    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUsername) {
      throw new AppError(`Username "${cleanUsername}" sudah digunakan.`, 400);
    }

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        throw new AppError(`Email "${cleanEmail}" sudah terdaftar.`, 400);
      }
    }

    let targetMechanicId = null;
    if (role === 'MEKANIK') {
      targetMechanicId = parseId(mechanicId);
      if (!targetMechanicId) {
        throw new AppError(
          'Untuk akun dengan role MEKANIK, wajib memilih profil teknisi mekanik.',
          400
        );
      }

      const mechanic = await prisma.mechanic.findUnique({
        where: { id: targetMechanicId },
      });
      if (!mechanic) {
        throw new AppError('Data teknisi mekanik tidak ditemukan.', 404);
      }

      // Check if mechanic already has a user account linked
      if (mechanic.user_id) {
        const linkedUser = await prisma.user.findUnique({ where: { id: mechanic.user_id } });
        throw new AppError(
          `Teknisi "${mechanic.nama}" sudah memiliki akun login (${linkedUser?.username || 'lain'}).`,
          400
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username: cleanUsername,
          password: hashedPassword,
          nama: String(nama).trim(),
          email: email ? String(email).trim().toLowerCase() : null,
          role,
          is_active: true,
        },
      });

      if (role === 'MEKANIK' && targetMechanicId) {
        await tx.mechanic.update({
          where: { id: targetMechanicId },
          data: { user_id: createdUser.id },
        });
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: { mechanic: true },
      });
    });

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
   * Update an existing user account
   */
  async updateUser(id, payload) {
    const userId = parseId(id);
    if (!userId) throw new AppError('ID pengguna tidak valid.', 400);

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: { mechanic: true },
    });

    if (!existing) {
      throw new AppError('Pengguna tidak ditemukan.', 404);
    }

    const { nama, email, role, mechanicId, password, isActive } = payload;
    const updateData = {};

    if (typeof nama !== 'undefined') updateData.nama = String(nama).trim();
    if (typeof email !== 'undefined') {
      const cleanEmail = email ? String(email).trim().toLowerCase() : null;
      if (cleanEmail && cleanEmail !== existing.email) {
        const emailCheck = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (emailCheck) throw new AppError(`Email "${cleanEmail}" sudah digunakan akun lain.`, 400);
      }
      updateData.email = cleanEmail;
    }

    if (typeof role !== 'undefined') {
      updateData.role = role;
    }

    if (password && String(password).trim().length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (typeof isActive !== 'undefined') {
      updateData.is_active = Boolean(isActive);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If role changed from MEKANIK to something else, unlink mechanic
      if (role && role !== 'MEKANIK' && existing.mechanic) {
        await tx.mechanic.update({
          where: { id: existing.mechanic.id },
          data: { user_id: null },
        });
      }

      // If linking new mechanic
      if (typeof mechanicId !== 'undefined' && (role === 'MEKANIK' || existing.role === 'MEKANIK')) {
        const mId = parseId(mechanicId);
        if (mId) {
          const targetMech = await tx.mechanic.findUnique({ where: { id: mId } });
          if (!targetMech) throw new AppError('Teknisi mekanik tidak ditemukan.', 404);

          if (targetMech.user_id && targetMech.user_id !== userId) {
            throw new AppError(`Teknisi "${targetMech.nama}" sudah terhubung ke akun lain.`, 400);
          }

          // Unlink previous mechanic if different
          if (existing.mechanic && existing.mechanic.id !== mId) {
            await tx.mechanic.update({
              where: { id: existing.mechanic.id },
              data: { user_id: null },
            });
          }

          await tx.mechanic.update({
            where: { id: mId },
            data: { user_id: userId },
          });
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      return tx.user.findUnique({
        where: { id: userId },
        include: { mechanic: true },
      });
    });

    return {
      id: updated.id,
      username: updated.username,
      nama: updated.nama,
      email: updated.email,
      role: updated.role,
      mechanicId: updated.mechanic?.id || null,
      mechanicName: updated.mechanic?.nama || null,
      isActive: updated.is_active,
      updatedAt: updated.updated_at,
    };
  }

  /**
   * Delete user account (Prevents self-deletion)
   */
  async deleteUser(id, currentUserId) {
    const userId = parseId(id);
    if (!userId) throw new AppError('ID pengguna tidak valid.', 400);

    if (userId === currentUserId) {
      throw new AppError('Anda tidak dapat menghapus akun Anda sendiri.', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new AppError('Pengguna tidak ditemukan.', 404);

    await prisma.user.delete({ where: { id: userId } });

    return { success: true, message: `Akun "${existing.username}" berhasil dihapus.` };
  }

  /**
   * Toggle user active status (Prevents self-deactivation)
   */
  async toggleUserStatus(id, currentUserId) {
    const userId = parseId(id);
    if (!userId) throw new AppError('ID pengguna tidak valid.', 400);

    if (userId === currentUserId) {
      throw new AppError('Anda tidak dapat menonaktifkan akun Anda sendiri.', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new AppError('Pengguna tidak ditemukan.', 404);

    const newStatus = !existing.is_active;

    await prisma.user.update({
      where: { id: userId },
      data: { is_active: newStatus },
    });

    if (!newStatus) {
      // Revoke all active tokens for deactivated user
      await prisma.refreshToken.deleteMany({ where: { user_id: userId } });
    }

    return {
      id: existing.id,
      username: existing.username,
      isActive: newStatus,
      message: `Akun "${existing.username}" berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
    };
  }
}

module.exports = new UserService();
