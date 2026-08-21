const bcrypt = require('bcryptjs');
const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId, normalizeText, calculateTenure } = require('../utils/formatters');

class MechanicService {
  /**
   * Format mechanic entity to clean API response
   */
  _formatMechanic(m) {
    const joiningDate = m.user?.tgl_masuk || m.created_at;
    const tenureText = calculateTenure(joiningDate);

    return {
      id: m.id,
      userId: m.user_id,
      nama: m.user?.nama || 'Tanpa Nama',
      username: m.user?.username || null,
      email: m.user?.email || null,
      tglLahir: m.user?.tgl_lahir || null,
      tglMasuk: joiningDate,
      masaKerja: tenureText,
      waktuKerja: tenureText, // Backward-compatible alias for frontend views
      spesialisasi: m.spesialisasi,
      isActive: m.is_active && (m.user ? m.user.is_active : true),
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    };
  }

  /**
   * Get all mechanics with their parent User identity
   */
  async getAllMechanics() {
    const mechanics = await prisma.mechanic.findMany({
      include: { user: true },
      orderBy: { user: { nama: 'asc' } },
    });

    return mechanics.map((m) => this._formatMechanic(m));
  }

  /**
   * Get mechanic by ID
   */
  async getMechanicById(id) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: { user: true },
    });
    if (!mechanic) throw new AppError('Data mekanik tidak ditemukan.', 404);

    return this._formatMechanic(mechanic);
  }

  /**
   * Create new mechanic with primary User account
   */
  async createMechanic(payload) {
    const nama = normalizeText(payload.nama);
    const spesialisasi = normalizeText(payload.spesialisasi) || 'Umum & Tune Up';
    const tglLahirStr = payload.tgl_lahir || payload.tglLahir || null;
    const tglLahir = tglLahirStr ? new Date(tglLahirStr) : null;
    const tglMasukStr = payload.tgl_masuk || payload.tglMasuk || null;
    const tglMasuk = tglMasukStr ? new Date(tglMasukStr) : new Date();
    const isActive = typeof payload.is_active === 'boolean' ? payload.is_active : true;

    if (!nama) {
      throw new AppError('Nama mekanik wajib diisi.', 400);
    }

    let userId = parseId(payload.userId || payload.user_id);

    const result = await prisma.$transaction(async (tx) => {
      // If no userId supplied, automatically create parent User account
      if (!userId) {
        const baseUsername = nama
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 15);
        let uniqueUsername = baseUsername || 'mekanik';
        let counter = 1;

        while (await tx.user.findUnique({ where: { username: uniqueUsername } })) {
          uniqueUsername = `${baseUsername}_${counter}`;
          counter++;
        }

        const defaultPasswordHash = await bcrypt.hash('password123', 10);
        const newUser = await tx.user.create({
          data: {
            username: uniqueUsername,
            password: defaultPasswordHash,
            nama,
            tgl_lahir: tglLahir,
            tgl_masuk: tglMasuk,
            role: 'MEKANIK',
            is_active: isActive,
          },
        });
        userId = newUser.id;
      } else {
        // Verify user exists and doesn't already have a mechanic profile
        const existingUser = await tx.user.findUnique({
          where: { id: userId },
          include: { mechanic: true },
        });
        if (!existingUser) throw new AppError('Pengguna tidak ditemukan.', 404);
        if (existingUser.mechanic) {
          throw new AppError(
            `Pengguna "${existingUser.username}" sudah terdaftar sebagai mekanik.`,
            400
          );
        }

        // Update user fields
        await tx.user.update({
          where: { id: userId },
          data: {
            nama,
            role: 'MEKANIK',
            ...(tglLahir ? { tgl_lahir: tglLahir } : {}),
            tgl_masuk: tglMasuk,
          },
        });
      }

      const created = await tx.mechanic.create({
        data: {
          user_id: userId,
          spesialisasi,
          is_active: isActive,
        },
        include: { user: true },
      });

      return created;
    });

    return this._formatMechanic(result);
  }

  /**
   * Update mechanic and parent User profile
   */
  async updateMechanic(id, payload) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    const existing = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: { user: true },
    });
    if (!existing) throw new AppError('Data mekanik tidak ditemukan.', 404);

    const mechData = {};
    const userData = {};

    if (payload.nama !== undefined) userData.nama = normalizeText(payload.nama);
    if (payload.tgl_lahir || payload.tglLahir) {
      userData.tgl_lahir = new Date(payload.tgl_lahir || payload.tglLahir);
    }
    if (payload.tgl_masuk || payload.tglMasuk) {
      userData.tgl_masuk = new Date(payload.tgl_masuk || payload.tglMasuk);
    }

    if (payload.spesialisasi !== undefined)
      mechData.spesialisasi = normalizeText(payload.spesialisasi);
    if (typeof payload.is_active === 'boolean') {
      mechData.is_active = payload.is_active;
      userData.is_active = payload.is_active;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0 && existing.user_id) {
        await tx.user.update({
          where: { id: existing.user_id },
          data: userData,
        });
      }

      const updated = await tx.mechanic.update({
        where: { id: mechanicId },
        data: mechData,
        include: { user: true },
      });

      return updated;
    });

    return this._formatMechanic(result);
  }

  /**
   * Delete mechanic
   */
  async deleteMechanic(id) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    await prisma.mechanic.delete({
      where: { id: mechanicId },
    });

    return { success: true, message: 'Data mekanik berhasil dihapus.' };
  }
}

module.exports = new MechanicService();
