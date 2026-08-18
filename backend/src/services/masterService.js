const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId, normalizeText, parsePrice } = require('../utils/formatters');

class MasterService {
  /**
   * Get all service master catalog
   */
  async getAllServices() {
    return prisma.serviceMaster.findMany({
      orderBy: [
        { is_active: 'desc' },
        { nama: 'asc' },
      ],
    });
  }

  /**
   * Get service master detail by ID
   */
  async getServiceById(id) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) {
      throw new AppError('ID jasa servis tidak valid.', 400);
    }

    const service = await prisma.serviceMaster.findUnique({
      where: { id: serviceMasterId },
    });

    if (!service) {
      throw new AppError('Data jasa servis tidak ditemukan.', 404);
    }

    return service;
  }

  /**
   * Create new service master
   */
  async createService(payload) {
    const nama = normalizeText(payload.nama);
    const harga = parsePrice(payload.harga);
    const deskripsi = normalizeText(payload.deskripsi);
    const isActive = typeof payload.is_active === 'boolean' ? payload.is_active : true;

    if (!nama || harga === null) {
      throw new AppError('Nama dan harga jasa servis wajib diisi.', 400);
    }

    return prisma.serviceMaster.create({
      data: {
        nama,
        harga,
        deskripsi: deskripsi || null,
        is_active: isActive,
      },
    });
  }

  /**
   * Update existing service master
   */
  async updateService(id, payload) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) {
      throw new AppError('ID jasa servis tidak valid.', 400);
    }

    const data = {};
    const nama = normalizeText(payload.nama);
    const harga = payload.harga !== undefined ? parsePrice(payload.harga) : null;
    const deskripsi = payload.deskripsi !== undefined ? normalizeText(payload.deskripsi) : undefined;
    const isActive = payload.is_active;

    if (nama) data.nama = nama;
    if (harga !== null) data.harga = harga;
    if (deskripsi !== undefined) data.deskripsi = deskripsi || null;
    if (typeof isActive === 'boolean') data.is_active = isActive;

    if (Object.keys(data).length === 0) {
      throw new AppError('Tidak ada data yang perlu diperbarui.', 400);
    }

    return prisma.serviceMaster.update({
      where: { id: serviceMasterId },
      data,
    });
  }

  /**
   * Delete service master by ID
   */
  async deleteService(id) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) {
      throw new AppError('ID jasa servis tidak valid.', 400);
    }

    return prisma.serviceMaster.delete({
      where: { id: serviceMasterId },
    });
  }

  /**
   * Get all motor brands
   */
  async getAllBrands() {
    return prisma.motorBrand.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  /**
   * Get motor types by brand ID
   */
  async getTypesByBrandId(brandIdParam) {
    const brandId = parseId(brandIdParam);
    if (!brandId) {
      throw new AppError('Parameter brandId wajib diisi.', 400);
    }

    return prisma.motorType.findMany({
      where: { brand_id: brandId },
      orderBy: { nama: 'asc' },
    });
  }

  /**
   * Get all engine capacities
   */
  async getAllCapacities() {
    return prisma.engineCapacity.findMany({
      orderBy: { kapasitas: 'asc' },
    });
  }
}

module.exports = new MasterService();
