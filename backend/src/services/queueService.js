const prisma = require('../db');
const AppError = require('../utils/appError');
const vehicleService = require('./vehicleService');
const { parseId, buildMotorLabel } = require('../utils/formatters');

class QueueService {
  /**
   * Get all services list formatted for the client
   */
  async getAllServices() {
    const services = await prisma.service.findMany({
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        mechanic: true,
      },
      orderBy: {
        tgl_masuk: 'desc',
      },
    });

    return services.map((s) => ({
      id: s.id,
      nopol: s.vehicle.nopol,
      motorType: `${s.vehicle.merk} ${s.vehicle.tipe} (${s.vehicle.kapasitas_mesin})`,
      customerName: s.vehicle.customer.nama,
      phone: s.vehicle.customer.telepon,
      keluhan: s.keluhan,
      mechanicName: s.mechanic ? s.mechanic.nama : null,
      status: s.status,
      isPaid: false,
      tgl_masuk: s.tgl_masuk,
      tgl_selesai: s.tgl_selesai,
    }));
  }

  /**
   * Register new service in a single database transaction
   * @param {object} payload
   */
  async createService(payload) {
    const { customerName, phone, nopol, motorType, keluhan, mechanicName, initialStatus } = payload;

    if (!customerName || !phone || !nopol || !keluhan) {
      throw new AppError('Semua kolom wajib diisi.', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create Customer
      let customer = await tx.customer.findFirst({
        where: { telepon: phone },
      });
      if (!customer) {
        customer = await tx.customer.create({
          data: { nama: customerName, telepon: phone },
        });
      }

      // 2. Find or create Vehicle (nopol is unique)
      let vehicle = await tx.vehicle.findUnique({
        where: { nopol: nopol.toUpperCase() },
      });

      if (!vehicle) {
        const motorSelection = await vehicleService.resolveMotorSelection(tx, payload);
        const vehicleKind = typeof payload.jenis === 'string' && payload.jenis.trim()
          ? payload.jenis.trim().toLowerCase()
          : (typeof motorType === 'string' && motorType.toLowerCase().includes('matic') ? 'matic' : 'bebek');

        vehicle = await tx.vehicle.create({
          data: {
            customer_id: customer.id,
            nopol: nopol.toUpperCase(),
            brand_id: motorSelection.brandId,
            motor_type_id: motorSelection.typeId,
            engine_capacity_id: motorSelection.capacityId,
            merk: motorSelection.brandName,
            tipe: motorSelection.typeName,
            kapasitas_mesin: motorSelection.capacityName,
            jenis: vehicleKind,
          },
        });
      }

      // 3. Find Mechanic if assigned
      let mechanic = null;
      if (mechanicName) {
        mechanic = await tx.mechanic.findFirst({
          where: { nama: mechanicName },
        });
      }

      // 4. Create Service record
      const status = initialStatus || (mechanic ? 'Dikerjakan' : 'Menunggu');
      const service = await tx.service.create({
        data: {
          vehicle_id: vehicle.id,
          mechanic_id: mechanic ? mechanic.id : null,
          keluhan,
          status,
        },
        include: {
          vehicle: {
            include: { customer: true },
          },
          mechanic: true,
        },
      });

      return service;
    });

    return {
      id: result.id,
      nopol: result.vehicle.nopol,
      motorType: buildMotorLabel(result.vehicle.merk, result.vehicle.tipe, result.vehicle.kapasitas_mesin),
      customerName: result.vehicle.customer.nama,
      phone: result.vehicle.customer.telepon,
      keluhan: result.keluhan,
      mechanicName: result.mechanic ? result.mechanic.nama : null,
      status: result.status,
      isPaid: false,
    };
  }

  /**
   * Update service status and mechanic assignment
   * @param {string|number} id
   * @param {object} payload
   */
  async updateServiceStatus(id, payload) {
    const serviceId = parseId(id);
    if (!serviceId) {
      throw new AppError('ID servis tidak valid.', 400);
    }

    const { status, mechanicName } = payload;
    let mechanicId = null;

    if (mechanicName) {
      const mechanic = await prisma.mechanic.findFirst({
        where: { nama: mechanicName },
      });
      if (mechanic) {
        mechanicId = mechanic.id;
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (mechanicId) {
      updateData.mechanic_id = mechanicId;
    }
    if (status === 'Selesai') {
      updateData.tgl_selesai = new Date();
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        vehicle: {
          include: { customer: true },
        },
        mechanic: true,
      },
    });

    return {
      id: updatedService.id,
      nopol: updatedService.vehicle.nopol,
      motorType: buildMotorLabel(updatedService.vehicle.merk, updatedService.vehicle.tipe, updatedService.vehicle.kapasitas_mesin),
      customerName: updatedService.vehicle.customer.nama,
      phone: updatedService.vehicle.customer.telepon,
      keluhan: updatedService.keluhan,
      mechanicName: updatedService.mechanic ? updatedService.mechanic.nama : null,
      status: updatedService.status,
      isPaid: false,
    };
  }
}

module.exports = new QueueService();
