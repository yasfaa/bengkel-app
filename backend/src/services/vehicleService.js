const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId, normalizeText } = require('../utils/formatters');

class VehicleService {
  /**
   * Search vehicle by license plate (nopol)
   * @param {string} nopol
   */
  async searchVehicleByNopol(nopol) {
    if (!nopol) {
      throw new AppError('Parameter nopol wajib diisi.', 400);
    }

    const cleanNopol = nopol.trim().toUpperCase();
    const formattedWithSpaces = cleanNopol.replace(
      /^([A-Z]{1,2})\s*(\d{1,4})\s*([A-Z]+)$/,
      '$1 $2 $3'
    );

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [{ nopol: { contains: cleanNopol } }, { nopol: { contains: formattedWithSpaces } }],
      },
      include: {
        customer: true,
        motorType: {
          include: {
            brand: true,
          },
        },
        engineCapacity: true,
      },
    });

    if (!vehicle) {
      return null;
    }

    const brandName = vehicle.motorType?.brand?.nama || 'Umum';
    const typeName = vehicle.motorType?.nama || 'Motor';
    const capacityName = vehicle.engineCapacity?.kapasitas || '-';

    return {
      id: vehicle.id,
      nopol: vehicle.nopol,
      merk: brandName,
      tipe: typeName,
      kapasitas_mesin: capacityName,
      jenis: vehicle.motorType?.jenis || 'matic',
      warna: vehicle.warna,
      tahunPembuatan: vehicle.tahun_pembuatan,
      km_terakhir: vehicle.km_terakhir,
      brandId: vehicle.motorType?.brand_id || null,
      typeId: vehicle.motor_type_id,
      capacityId: vehicle.engine_capacity_id,
      brandName,
      typeName,
      capacityName,
      customer: vehicle.customer,
    };
  }

  /**
   * Resolve motor brand, type, and capacity from IDs or fallback text
   * @param {*} tx Prisma Transaction Client
   * @param {object} body
   */
  async resolveMotorSelection(tx, body) {
    const brandId = parseId(body.brandId);
    const typeId = parseId(body.typeId);
    const capacityId = parseId(body.capacityId);

    // 1. Direct IDs provided
    if (brandId && typeId && capacityId) {
      const [brand, type, capacity] = await Promise.all([
        tx.motorBrand.findUnique({ where: { id: brandId } }),
        tx.motorType.findUnique({ where: { id: typeId }, include: { brand: true } }),
        tx.engineCapacity.findUnique({ where: { id: capacityId } }),
      ]);

      if (brand && type && capacity && type.brand_id === brand.id) {
        return {
          brandId: brand.id,
          typeId: type.id,
          capacityId: capacity.id,
          brandName: brand.nama,
          typeName: type.nama,
          capacityName: capacity.kapasitas,
          jenis: type.jenis,
        };
      }
    }

    // 2. Resolve via text names (upsert if needed)
    const motorType = normalizeText(body.motorType);
    const fallbackParts = motorType.split(/\s+/).filter(Boolean);
    const brandName = normalizeText(body.brandName) || fallbackParts[0] || 'Umum';
    const capacityName = normalizeText(body.capacityName) || '110cc';
    const typeName = normalizeText(body.typeName) || fallbackParts.slice(1).join(' ') || 'Motor';
    const vehicleJenis =
      typeof body.jenis === 'string' && body.jenis.trim()
        ? body.jenis.trim().toLowerCase()
        : motorType.toLowerCase().includes('matic')
          ? 'matic'
          : 'bebek';

    const resolvedBrand = await tx.motorBrand.upsert({
      where: { nama: brandName },
      update: {},
      create: { nama: brandName },
    });

    const resolvedType = await tx.motorType.upsert({
      where: {
        brand_id_nama: {
          brand_id: resolvedBrand.id,
          nama: typeName,
        },
      },
      update: {
        jenis: vehicleJenis,
      },
      create: {
        brand_id: resolvedBrand.id,
        nama: typeName,
        jenis: vehicleJenis,
      },
    });

    const resolvedCapacity = await tx.engineCapacity.upsert({
      where: { kapasitas: capacityName },
      update: {},
      create: { kapasitas: capacityName },
    });

    return {
      brandId: resolvedBrand.id,
      typeId: resolvedType.id,
      capacityId: resolvedCapacity.id,
      brandName: resolvedBrand.nama,
      typeName: resolvedType.nama,
      capacityName: resolvedCapacity.kapasitas,
      jenis: resolvedType.jenis,
    };
  }
}

module.exports = new VehicleService();
