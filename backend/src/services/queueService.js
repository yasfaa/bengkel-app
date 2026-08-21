const prisma = require('../db');
const AppError = require('../utils/appError');
const vehicleService = require('./vehicleService');
const { parseId, parsePrice, normalizeText, buildMotorLabel } = require('../utils/formatters');

class QueueService {
  /**
   * Helper to generate unique PKB number with daily sequence reset (PKB-YYYYMMDD-XXX)
   * Tracks daily transactions and resets counter to 001 at the beginning of each day.
   * @param {*} tx Prisma Transaction Client
   */
  async generateNomorPkb(tx) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const prefix = `PKB-${dateStr}-`;

    // Cari nomor PKB tertinggi yang sudah tercatat pada hari berjalan
    const latestPkbToday = await tx.service.findFirst({
      where: {
        nomor_pkb: {
          startsWith: prefix,
        },
      },
      orderBy: {
        nomor_pkb: 'desc',
      },
      select: {
        nomor_pkb: true,
      },
    });

    let nextSeq = 1;
    if (latestPkbToday && latestPkbToday.nomor_pkb) {
      const parts = latestPkbToday.nomor_pkb.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }

    const seq = String(nextSeq).padStart(3, '0');
    return `${prefix}${seq}`;
  }

  /**
   * Get all services formatted for client with PKB metadata and normalized relations
   * Role Scoping:
   * - ADMIN: Sees ALL services (including unassigned mechanic_id: null)
   * - MEKANIK: Only sees services explicitly assigned to their mechanicId (where.mechanic_id = user.mechanicId)
   * - KEPALA_BENGKEL: Sees all assigned services for business recap (unassigned services only appear for Admin)
   * @param {object} [user] - Active authenticated user
   */
  async getAllServices(user = null) {
    const where = {};

    if (user) {
      if (user.role === 'MEKANIK') {
        where.mechanic_id = user.mechanicId ? user.mechanicId : -1;
      } else if (user.role === 'KEPALA_BENGKEL') {
        where.mechanic_id = { not: null };
      }
      // ADMIN sees everything (including mechanic_id: null)
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        vehicle: {
          include: {
            customer: true,
            motorType: {
              include: {
                brand: true,
              },
            },
            engineCapacity: true,
          },
        },
        mechanic: {
          include: {
            user: true,
          },
        },
        serviceMaster: true,
        serviceItems: {
          include: {
            sparepart: true,
            serviceMaster: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: {
        tgl_masuk: 'desc',
      },
    });

    return services.map((s) => {
      const brandName = s.vehicle?.motorType?.brand?.nama || 'Umum';
      const typeName = s.vehicle?.motorType?.nama || 'Motor';
      const capacityName = s.vehicle?.engineCapacity?.kapasitas || '-';

      const items = (s.serviceItems || []).map((item) => {
        const status =
          item.approval_status || (item.is_approved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');
        return {
          id: item.id,
          serviceId: item.service_id,
          itemType: item.item_type,
          sparepartId: item.sparepart_id,
          kodePart: item.sparepart?.kode_part || null,
          namaItem: item.nama_item || item.sparepart?.nama || item.serviceMaster?.nama || 'Item',
          serviceMasterId: item.service_master_id,
          quantity: item.quantity,
          currentStock: item.sparepart ? item.sparepart.stok : null,
          hargaSatuan: item.harga_satuan,
          subtotal: item.subtotal,
          approvalStatus: status,
          isApproved: status === 'DISETUJUI',
          catatan: item.catatan,
        };
      });

      return {
        id: s.id,
        nomorPkb: s.nomor_pkb || `PKB-${s.id}`,
        nopol: s.vehicle.nopol,
        motorType: buildMotorLabel(brandName, typeName, capacityName),
        customerName: s.vehicle.customer.nama,
        phone: s.vehicle.customer.telepon,
        warna: s.vehicle.warna,
        tahunPembuatan: s.vehicle.tahun_pembuatan,
        kmMasuk: s.km_masuk || 0,
        levelBensin: s.level_bensin || '-',
        catatanKondisi: s.catatan_kondisi || '-',
        keluhan: s.keluhan,
        serviceMasterId: s.service_master_id,
        servicePackageName: s.serviceMaster ? s.serviceMaster.nama : null,
        estimasiBiaya: s.estimasi_biaya || 0,
        mechanicName: s.mechanic ? s.mechanic.user?.nama || null : null,
        mechanicSpecialization: s.mechanic ? s.mechanic.spesialisasi : null,
        status: s.status,
        isPaid: false,
        serviceItems: items,
        tgl_masuk: s.tgl_masuk,
        tgl_selesai: s.tgl_selesai,
      };
    });
  }

  /**
   * Register new service / PKB in a single database transaction
   * Business Rule: Initial status is ALWAYS 'Menunggu' regardless of mechanic assignment
   * @param {object} payload
   */
  async createService(payload) {
    const {
      customerName,
      phone,
      nopol,
      keluhan,
      mechanicName,
      initialStatus,
      kmMasuk,
      levelBensin,
      catatanKondisi,
      serviceMasterId,
      estimasiBiaya,
      warna,
      tahunPembuatan,
    } = payload;

    if (!customerName || !phone || !nopol || !keluhan) {
      throw new AppError('Nama, telepon, nomor polisi, dan keluhan wajib diisi.', 400);
    }

    const kmNumber = parseId(kmMasuk) || 0;
    const sMasterId = parseId(serviceMasterId);
    const parsedEstBiaya = parsePrice(estimasiBiaya) || 0;
    const parsedTahun = parseId(tahunPembuatan);
    const normalizedWarna = normalizeText(warna) || null;

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
        include: {
          motorType: {
            include: { brand: true },
          },
          engineCapacity: true,
        },
      });

      if (!vehicle) {
        const motorSelection = await vehicleService.resolveMotorSelection(tx, payload);

        vehicle = await tx.vehicle.create({
          data: {
            customer_id: customer.id,
            nopol: nopol.toUpperCase(),
            motor_type_id: motorSelection.typeId,
            engine_capacity_id: motorSelection.capacityId,
            warna: normalizedWarna,
            tahun_pembuatan: parsedTahun,
            km_terakhir: kmNumber,
          },
          include: {
            motorType: {
              include: { brand: true },
            },
            engineCapacity: true,
          },
        });
      } else {
        const updateVehicleData = { km_terakhir: kmNumber };
        if (normalizedWarna) updateVehicleData.warna = normalizedWarna;
        if (parsedTahun) updateVehicleData.tahun_pembuatan = parsedTahun;

        vehicle = await tx.vehicle.update({
          where: { id: vehicle.id },
          data: updateVehicleData,
          include: {
            motorType: {
              include: { brand: true },
            },
            engineCapacity: true,
          },
        });
      }

      // 3. Find Mechanic if assigned
      let mechanic = null;
      if (mechanicName) {
        mechanic = await tx.mechanic.findFirst({
          where: { user: { nama: mechanicName } },
          include: { user: true },
        });
      }

      // 4. Generate PKB Number
      const nomorPkb = await this.generateNomorPkb(tx);

      // 5. Create Service / PKB record
      // Business SOP Rule: At Reception (Stage 1), status is ALWAYS 'Menunggu'
      const status = initialStatus || 'Menunggu';
      const service = await tx.service.create({
        data: {
          nomor_pkb: nomorPkb,
          vehicle_id: vehicle.id,
          mechanic_id: mechanic ? mechanic.id : null,
          service_master_id: sMasterId || null,
          km_masuk: kmNumber,
          level_bensin: normalizeText(levelBensin) || '1/2',
          catatan_kondisi: normalizeText(catatanKondisi) || null,
          keluhan,
          estimasi_biaya: parsedEstBiaya,
          status,
        },
        include: {
          vehicle: {
            include: {
              customer: true,
              motorType: {
                include: { brand: true },
              },
              engineCapacity: true,
            },
          },
          mechanic: {
            include: { user: true },
          },
          serviceMaster: true,
        },
      });

      return service;
    });

    const brandName = result.vehicle?.motorType?.brand?.nama || 'Umum';
    const typeName = result.vehicle?.motorType?.nama || 'Motor';
    const capacityName = result.vehicle?.engineCapacity?.kapasitas || '-';

    return {
      id: result.id,
      nomorPkb: result.nomor_pkb,
      nopol: result.vehicle.nopol,
      motorType: buildMotorLabel(brandName, typeName, capacityName),
      customerName: result.vehicle.customer.nama,
      phone: result.vehicle.customer.telepon,
      warna: result.vehicle.warna,
      tahunPembuatan: result.vehicle.tahun_pembuatan,
      kmMasuk: result.km_masuk,
      levelBensin: result.level_bensin,
      catatanKondisi: result.catatan_kondisi,
      keluhan: result.keluhan,
      serviceMasterId: result.service_master_id,
      servicePackageName: result.serviceMaster ? result.serviceMaster.nama : null,
      estimasiBiaya: result.estimasi_biaya,
      mechanicName: result.mechanic ? result.mechanic.user?.nama || null : null,
      mechanicSpecialization: result.mechanic ? result.mechanic.spesialisasi : null,
      status: result.status,
      isPaid: false,
      tgl_masuk: result.tgl_masuk,
    };
  }

  /**
   * Update service status and mechanic assignment (Stage 2 Pit Allocation & Stage 4 Finish)
   * Validates busy mechanics, reassignments, and role permissions
   * @param {string|number} id
   * @param {object} payload
   * @param {object} [user]
   */
  async updateServiceStatus(id, payload, user = null) {
    const serviceId = parseId(id);
    if (!serviceId) {
      throw new AppError('ID servis tidak valid.', 400);
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        mechanic: {
          include: { user: true },
        },
        vehicle: true,
      },
    });

    if (!existingService) {
      throw new AppError('Data antrean servis tidak ditemukan.', 404);
    }

    const { status, mechanicName, allowBusyOverride } = payload;
    let targetMechanic = existingService.mechanic;

    if (user) {
      if (status === 'Selesai') {
        if (user.role === 'ADMIN') {
          throw new AppError(
            'Penyelesaian servis hanya dapat dilakukan oleh teknisi mekanik pelaksana.',
            403
          );
        }
        if (user.role === 'KEPALA_BENGKEL') {
          throw new AppError('Kepala Bengkel hanya memiliki hak akses lihat (view-only).', 403);
        }
        if (
          user.role === 'MEKANIK' &&
          existingService.mechanic_id &&
          existingService.mechanic_id !== user.mechanicId
        ) {
          throw new AppError('Anda hanya dapat menyelesaikan servis yang ditugaskan ke Anda.', 403);
        }
      }
    }

    if (mechanicName) {
      targetMechanic = await prisma.mechanic.findFirst({
        where: { user: { nama: mechanicName } },
        include: { user: true },
      });
      if (!targetMechanic) {
        throw new AppError(`Mekanik dengan nama "${mechanicName}" tidak ditemukan.`, 404);
      }
    }

    // Business Rule 1: Transitioning to 'Dikerjakan' requires an assigned mechanic
    if (status === 'Dikerjakan' && !targetMechanic) {
      throw new AppError(
        'Harap pilih teknisi / mekanik terlebih dahulu untuk memulai pengerjaan servis.',
        400
      );
    }

    // Business Rule 2: Validate if mechanic is currently busy working on another vehicle
    if (status === 'Dikerjakan' && targetMechanic && !allowBusyOverride) {
      const busyJob = await prisma.service.findFirst({
        where: {
          mechanic_id: targetMechanic.id,
          status: 'Dikerjakan',
          id: { not: serviceId },
        },
        include: { vehicle: true },
      });

      if (busyJob) {
        const mechName = targetMechanic.user?.nama || 'Mekanik';
        throw new AppError(
          `Mekanik ${mechName} saat ini sedang aktif mengerjakan kendaraan [${busyJob.vehicle.nopol}]. Selesaikan servis tersebut terlebih dahulu atau pilih mekanik lain yang sedang Standby.`,
          400
        );
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (targetMechanic) {
      updateData.mechanic_id = targetMechanic.id;
    }
    if (status === 'Selesai') {
      updateData.tgl_selesai = new Date();
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        vehicle: {
          include: {
            customer: true,
            motorType: {
              include: { brand: true },
            },
            engineCapacity: true,
          },
        },
        mechanic: {
          include: { user: true },
        },
        serviceMaster: true,
        serviceItems: {
          include: {
            sparepart: true,
            serviceMaster: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    const brandName = updatedService.vehicle?.motorType?.brand?.nama || 'Umum';
    const typeName = updatedService.vehicle?.motorType?.nama || 'Motor';
    const capacityName = updatedService.vehicle?.engineCapacity?.kapasitas || '-';

    const items = (updatedService.serviceItems || []).map((item) => {
      const itemStatus =
        item.approval_status || (item.is_approved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');
      return {
        id: item.id,
        serviceId: item.service_id,
        itemType: item.item_type,
        sparepartId: item.sparepart_id,
        kodePart: item.sparepart?.kode_part || null,
        namaItem: item.nama_item || item.sparepart?.nama || item.serviceMaster?.nama || 'Item',
        serviceMasterId: item.service_master_id,
        quantity: item.quantity,
        currentStock: item.sparepart ? item.sparepart.stok : null,
        hargaSatuan: item.harga_satuan,
        subtotal: item.subtotal,
        approvalStatus: itemStatus,
        isApproved: itemStatus === 'DISETUJUI',
        catatan: item.catatan,
      };
    });

    return {
      id: updatedService.id,
      nomorPkb: updatedService.nomor_pkb,
      nopol: updatedService.vehicle.nopol,
      motorType: buildMotorLabel(brandName, typeName, capacityName),
      customerName: updatedService.vehicle.customer.nama,
      phone: updatedService.vehicle.customer.telepon,
      warna: updatedService.vehicle.warna,
      tahunPembuatan: updatedService.vehicle.tahun_pembuatan,
      kmMasuk: updatedService.km_masuk,
      levelBensin: updatedService.level_bensin,
      catatanKondisi: updatedService.catatan_kondisi,
      keluhan: updatedService.keluhan,
      serviceMasterId: updatedService.service_master_id,
      servicePackageName: updatedService.serviceMaster ? updatedService.serviceMaster.nama : null,
      estimasiBiaya: updatedService.estimasi_biaya,
      mechanicName: updatedService.mechanic ? updatedService.mechanic.user?.nama || null : null,
      mechanicSpecialization: updatedService.mechanic ? updatedService.mechanic.spesialisasi : null,
      status: updatedService.status,
      isPaid: false,
      serviceItems: items,
      tgl_masuk: updatedService.tgl_masuk,
      tgl_selesai: updatedService.tgl_selesai,
    };
  }
}

module.exports = new QueueService();
