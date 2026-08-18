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

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        nopol: {
          contains: nopol,
        },
      },
      include: {
        customer: true,
        brand: true,
        motorTypeMaster: true,
        engineCapacity: true,
      },
    });

    if (!vehicle) {
      return null;
    }

    return {
      ...vehicle,
      brandId: vehicle.brand_id,
      typeId: vehicle.motor_type_id,
      capacityId: vehicle.engine_capacity_id,
      brandName: vehicle.brand ? vehicle.brand.nama : vehicle.merk,
      typeName: vehicle.motorTypeMaster ? vehicle.motorTypeMaster.nama : vehicle.tipe,
      capacityName: vehicle.engineCapacity ? vehicle.engineCapacity.kapasitas : vehicle.kapasitas_mesin,
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
        };
      }
    }

    const motorType = normalizeText(body.motorType);
    const fallbackParts = motorType.split(/\s+/).filter(Boolean);
    const brandName = normalizeText(body.brandName) || fallbackParts[0] || 'Umum';
    const capacityName = normalizeText(body.capacityName) || '150cc';
    const typeName = normalizeText(body.typeName) || fallbackParts.slice(1).join(' ') || 'Motor';

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
      update: {},
      create: {
        brand_id: resolvedBrand.id,
        nama: typeName,
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
    };
  }
}

module.exports = new VehicleService();
