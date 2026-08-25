const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId, normalizeText, parsePrice } = require('../utils/formatters');

class MasterService {
  /* =========================================================================
     1. ServiceMaster CRUD
     ========================================================================= */
  formatServiceMaster(item) {
    if (!item) return null;
    return {
      ...item,
      harga: Number(item.harga),
    };
  }

  formatSparepart(item) {
    if (!item) return null;
    return {
      ...item,
      harga_beli: Number(item.harga_beli),
      harga_jual: Number(item.harga_jual),
      hargaBeli: Number(item.harga_beli),
      hargaJual: Number(item.harga_jual),
      supplier: item.supplier ? item.supplier.nama : '-',
    };
  }

  async getAllServices() {
    const list = await prisma.serviceMaster.findMany({
      orderBy: [{ is_active: 'desc' }, { nama: 'asc' }],
    });
    return list.map((item) => this.formatServiceMaster(item));
  }

  async getServiceById(id) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) throw new AppError('ID jasa servis tidak valid.', 400);

    const service = await prisma.serviceMaster.findUnique({
      where: { id: serviceMasterId },
    });
    if (!service) throw new AppError('Data jasa servis tidak ditemukan.', 404);

    return this.formatServiceMaster(service);
  }

  async createService(payload) {
    const nama = normalizeText(payload.nama);
    const harga = parsePrice(payload.harga);
    const deskripsi = normalizeText(payload.deskripsi);
    const estimasiDurasi = parseId(payload.estimasi_durasi) || 30;
    const kategori = normalizeText(payload.kategori) || 'RINGAN';
    const isActive = typeof payload.is_active === 'boolean' ? payload.is_active : true;

    if (!nama || harga === null) {
      throw new AppError('Nama dan harga jasa servis wajib diisi.', 400);
    }

    const created = await prisma.serviceMaster.create({
      data: {
        nama,
        harga,
        deskripsi: deskripsi || null,
        estimasi_durasi: estimasiDurasi,
        kategori,
        is_active: isActive,
      },
    });
    return this.formatServiceMaster(created);
  }

  async updateService(id, payload) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) throw new AppError('ID jasa servis tidak valid.', 400);

    const data = {};
    if (payload.nama !== undefined) data.nama = normalizeText(payload.nama);
    if (payload.harga !== undefined) data.harga = parsePrice(payload.harga);
    if (payload.deskripsi !== undefined) data.deskripsi = normalizeText(payload.deskripsi) || null;
    if (payload.estimasi_durasi !== undefined)
      data.estimasi_durasi = parseId(payload.estimasi_durasi);
    if (payload.kategori !== undefined) data.kategori = normalizeText(payload.kategori);
    if (typeof payload.is_active === 'boolean') data.is_active = payload.is_active;

    if (Object.keys(data).length === 0) {
      throw new AppError('Tidak ada data yang perlu diperbarui.', 400);
    }

    const updated = await prisma.serviceMaster.update({
      where: { id: serviceMasterId },
      data,
    });
    return this.formatServiceMaster(updated);
  }

  async deleteService(id) {
    const serviceMasterId = parseId(id);
    if (!serviceMasterId) throw new AppError('ID jasa servis tidak valid.', 400);

    return prisma.serviceMaster.delete({
      where: { id: serviceMasterId },
    });
  }

  /* =========================================================================
     2. MotorBrand CRUD
     ========================================================================= */
  async getAllBrands() {
    return prisma.motorBrand.findMany({
      include: {
        types: true,
      },
      orderBy: { nama: 'asc' },
    });
  }

  async createBrand(payload) {
    const nama = normalizeText(payload.nama);
    if (!nama) throw new AppError('Nama merk motor wajib diisi.', 400);

    return prisma.motorBrand.create({
      data: { nama },
    });
  }

  async updateBrand(id, payload) {
    const brandId = parseId(id);
    if (!brandId) throw new AppError('ID merk motor tidak valid.', 400);

    const nama = normalizeText(payload.nama);
    if (!nama) throw new AppError('Nama merk motor wajib diisi.', 400);

    return prisma.motorBrand.update({
      where: { id: brandId },
      data: { nama },
    });
  }

  async deleteBrand(id) {
    const brandId = parseId(id);
    if (!brandId) throw new AppError('ID merk motor tidak valid.', 400);

    return prisma.motorBrand.delete({
      where: { id: brandId },
    });
  }

  /* =========================================================================
     3. MotorType CRUD
     ========================================================================= */
  async getTypesByBrandId(brandIdParam) {
    const where = {};
    if (brandIdParam) {
      const brandId = parseId(brandIdParam);
      if (brandId) where.brand_id = brandId;
    }

    return prisma.motorType.findMany({
      where,
      include: {
        brand: true,
        engineCapacity: true,
      },
      orderBy: { nama: 'asc' },
    });
  }

  async createType(payload) {
    const nama = normalizeText(payload.nama);
    const brandId = parseId(payload.brand_id || payload.brandId);
    const jenis = normalizeText(payload.jenis) || 'matic';
    const capacityId = parseId(payload.engine_capacity_id || payload.capacityId);

    if (!nama || !brandId) {
      throw new AppError('Nama tipe motor dan brand_id wajib diisi.', 400);
    }

    return prisma.motorType.create({
      data: {
        nama,
        brand_id: brandId,
        jenis,
        engine_capacity_id: capacityId || null,
      },
      include: { brand: true, engineCapacity: true },
    });
  }

  async updateType(id, payload) {
    const typeId = parseId(id);
    if (!typeId) throw new AppError('ID tipe motor tidak valid.', 400);

    const data = {};
    if (payload.nama !== undefined) data.nama = normalizeText(payload.nama);
    if (payload.brand_id !== undefined || payload.brandId !== undefined) {
      data.brand_id = parseId(payload.brand_id || payload.brandId);
    }
    if (payload.jenis !== undefined) data.jenis = normalizeText(payload.jenis);
    if (payload.engine_capacity_id !== undefined || payload.capacityId !== undefined) {
      data.engine_capacity_id = parseId(payload.engine_capacity_id || payload.capacityId);
    }

    return prisma.motorType.update({
      where: { id: typeId },
      data,
      include: { brand: true, engineCapacity: true },
    });
  }

  async deleteType(id) {
    const typeId = parseId(id);
    if (!typeId) throw new AppError('ID tipe motor tidak valid.', 400);

    return prisma.motorType.delete({
      where: { id: typeId },
    });
  }

  /* =========================================================================
     4. EngineCapacity CRUD
     ========================================================================= */
  async getAllCapacities() {
    return prisma.engineCapacity.findMany({
      orderBy: { kapasitas: 'asc' },
    });
  }

  async createCapacity(payload) {
    const kapasitas = normalizeText(payload.kapasitas);
    if (!kapasitas) throw new AppError('Kapasitas mesin (cc) wajib diisi.', 400);

    return prisma.engineCapacity.create({
      data: { kapasitas },
    });
  }

  async updateCapacity(id, payload) {
    const capacityId = parseId(id);
    if (!capacityId) throw new AppError('ID kapasitas mesin tidak valid.', 400);

    const kapasitas = normalizeText(payload.kapasitas);
    if (!kapasitas) throw new AppError('Kapasitas mesin wajib diisi.', 400);

    return prisma.engineCapacity.update({
      where: { id: capacityId },
      data: { kapasitas },
    });
  }

  async deleteCapacity(id) {
    const capacityId = parseId(id);
    if (!capacityId) throw new AppError('ID kapasitas mesin tidak valid.', 400);

    return prisma.engineCapacity.delete({
      where: { id: capacityId },
    });
  }

  /* =========================================================================
     5. Supplier CRUD
     ========================================================================= */
  async getAllSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  async createSupplier(payload) {
    const nama = normalizeText(payload.nama);
    const telepon = normalizeText(payload.telepon) || null;
    const alamat = normalizeText(payload.alamat) || null;

    if (!nama) throw new AppError('Nama supplier wajib diisi.', 400);

    return prisma.supplier.create({
      data: { nama, telepon, alamat },
    });
  }

  async updateSupplier(id, payload) {
    const supplierId = parseId(id);
    if (!supplierId) throw new AppError('ID supplier tidak valid.', 400);

    const data = {};
    if (payload.nama !== undefined) data.nama = normalizeText(payload.nama);
    if (payload.telepon !== undefined) data.telepon = normalizeText(payload.telepon) || null;
    if (payload.alamat !== undefined) data.alamat = normalizeText(payload.alamat) || null;

    return prisma.supplier.update({
      where: { id: supplierId },
      data,
    });
  }

  async deleteSupplier(id) {
    const supplierId = parseId(id);
    if (!supplierId) throw new AppError('ID supplier tidak valid.', 400);

    return prisma.supplier.delete({
      where: { id: supplierId },
    });
  }

  /* =========================================================================
     6. Sparepart CRUD
     ========================================================================= */
  formatSparepart(p) {
    return {
      id: p.id,
      kode_part: p.kode_part,
      nama: p.nama,
      name: p.nama,
      kategori: p.kategori,
      stok: p.stok,
      min_stok: p.min_stok,
      harga_beli: Number(p.harga_beli),
      harga_jual: Number(p.harga_jual),
      hargaBeli: Number(p.harga_beli),
      hargaJual: Number(p.harga_jual),
      supplier_id: p.supplier_id,
      supplier: p.supplier ? p.supplier.nama : '-',
      supplier_detail: p.supplier,
    };
  }

  async getAllSpareparts() {
    const parts = await prisma.sparepart.findMany({
      include: { supplier: true },
      orderBy: { nama: 'asc' },
    });

    return parts.map((p) => this.formatSparepart(p));
  }

  async getSparepartById(id) {
    const sparepartId = parseId(id);
    if (!sparepartId) throw new AppError('ID sparepart tidak valid.', 400);

    const sparepart = await prisma.sparepart.findUnique({
      where: { id: sparepartId },
      include: { supplier: true },
    });
    if (!sparepart) throw new AppError('Data sparepart tidak ditemukan.', 404);

    return this.formatSparepart(sparepart);
  }

  async createSparepart(payload) {
    const kode_part = normalizeText(payload.kode_part || payload.kodePart);
    const nama = normalizeText(payload.nama || payload.name);
    const kategori = normalizeText(payload.kategori) || 'FAST_MOVING';
    const stok = parseId(payload.stok) || 0;
    const min_stok = parseId(payload.min_stok || payload.minStok) || 5;
    const harga_beli = parsePrice(payload.harga_beli || payload.hargaBeli) || 0;
    const harga_jual = parsePrice(payload.harga_jual || payload.hargaJual) || 0;
    const supplier_id = parseId(payload.supplier_id || payload.supplierId);

    if (!kode_part || !nama) {
      throw new AppError('Kode part (SKU) dan nama suku cadang wajib diisi.', 400);
    }

    const created = await prisma.sparepart.create({
      data: {
        kode_part,
        nama,
        kategori,
        stok,
        min_stok,
        harga_beli,
        harga_jual,
        supplier_id: supplier_id || null,
      },
      include: { supplier: true },
    });
    return this.formatSparepart(created);
  }

  async updateSparepart(id, payload) {
    const sparepartId = parseId(id);
    if (!sparepartId) throw new AppError('ID sparepart tidak valid.', 400);

    const data = {};
    if (payload.kode_part !== undefined || payload.kodePart !== undefined) {
      data.kode_part = normalizeText(payload.kode_part || payload.kodePart);
    }
    if (payload.nama !== undefined || payload.name !== undefined) {
      data.nama = normalizeText(payload.nama || payload.name);
    }
    if (payload.kategori !== undefined) data.kategori = normalizeText(payload.kategori);
    if (payload.stok !== undefined) data.stok = parseId(payload.stok);
    if (payload.min_stok !== undefined || payload.minStok !== undefined) {
      data.min_stok = parseId(payload.min_stok || payload.minStok);
    }
    if (payload.harga_beli !== undefined || payload.hargaBeli !== undefined) {
      data.harga_beli = parsePrice(payload.harga_beli || payload.hargaBeli);
    }
    if (payload.harga_jual !== undefined || payload.hargaJual !== undefined) {
      data.harga_jual = parsePrice(payload.harga_jual || payload.hargaJual);
    }
    if (payload.supplier_id !== undefined || payload.supplierId !== undefined) {
      data.supplier_id = parseId(payload.supplier_id || payload.supplierId);
    }

    const updated = await prisma.sparepart.update({
      where: { id: sparepartId },
      data,
      include: { supplier: true },
    });
    return this.formatSparepart(updated);
  }

  async deleteSparepart(id) {
    const sparepartId = parseId(id);
    if (!sparepartId) throw new AppError('ID sparepart tidak valid.', 400);

    return prisma.sparepart.delete({
      where: { id: sparepartId },
    });
  }
}

module.exports = new MasterService();
