const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId, normalizeText } = require('../utils/formatters');

class MechanicService {
  /**
   * Get all mechanics
   */
  async getAllMechanics() {
    return prisma.mechanic.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  /**
   * Get mechanic by ID
   */
  async getMechanicById(id) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });
    if (!mechanic) throw new AppError('Data mekanik tidak ditemukan.', 404);

    return mechanic;
  }

  /**
   * Create new mechanic
   */
  async createMechanic(payload) {
    const nama = normalizeText(payload.nama);
    const waktuKerja = normalizeText(payload.waktu_kerja || payload.waktuKerja) || 'Full-time (08:00 - 17:00)';
    const spesialisasi = normalizeText(payload.spesialisasi) || 'Umum & Tune Up';
    const tglLahirStr = payload.tgl_lahir || payload.tglLahir || '1995-01-01';
    const tglLahir = new Date(tglLahirStr);
    const isActive = typeof payload.is_active === 'boolean' ? payload.is_active : true;

    if (!nama) {
      throw new AppError('Nama mekanik wajib diisi.', 400);
    }

    return prisma.mechanic.create({
      data: {
        nama,
        waktu_kerja: waktuKerja,
        spesialisasi,
        tgl_lahir: tglLahir,
        is_active: isActive,
      },
    });
  }

  /**
   * Update mechanic
   */
  async updateMechanic(id, payload) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    const data = {};
    if (payload.nama !== undefined) data.nama = normalizeText(payload.nama);
    if (payload.waktu_kerja !== undefined || payload.waktuKerja !== undefined) {
      data.waktu_kerja = normalizeText(payload.waktu_kerja || payload.waktuKerja);
    }
    if (payload.spesialisasi !== undefined) data.spesialisasi = normalizeText(payload.spesialisasi);
    if (payload.tgl_lahir || payload.tglLahir) {
      data.tgl_lahir = new Date(payload.tgl_lahir || payload.tglLahir);
    }
    if (typeof payload.is_active === 'boolean') data.is_active = payload.is_active;

    return prisma.mechanic.update({
      where: { id: mechanicId },
      data,
    });
  }

  /**
   * Delete mechanic
   */
  async deleteMechanic(id) {
    const mechanicId = parseId(id);
    if (!mechanicId) throw new AppError('ID mekanik tidak valid.', 400);

    return prisma.mechanic.delete({
      where: { id: mechanicId },
    });
  }
}

module.exports = new MechanicService();
