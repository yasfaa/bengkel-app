const prisma = require('../db');
const AppError = require('../utils/appError');
const { parseId } = require('../utils/formatters');

class ServiceItemService {
  /**
   * Recalculate total estimated cost for a Service based on base package and approved service items
   * @param {*} tx Prisma Transaction Client
   * @param {number} serviceId
   */
  async recalculateServiceEstimate(tx, serviceId) {
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceMaster: true,
        serviceItems: true,
      },
    });

    if (!service) return 0;

    // Calculate sum of approved items only (approval_status === 'DISETUJUI')
    let totalItems = 0;
    for (const item of service.serviceItems) {
      if (
        item.approval_status === 'DISETUJUI' ||
        (item.is_approved && item.approval_status !== 'DITOLAK')
      ) {
        totalItems += Number(item.subtotal || 0);
      }
    }

    // If there's a base service package and it hasn't been added as a service item yet, include it
    let totalEstimate = totalItems;
    const hasBaseItem = service.serviceItems.some(
      (it) => it.item_type === 'JASA' && it.service_master_id === service.service_master_id
    );

    if (!hasBaseItem && service.serviceMaster && service.serviceMaster.harga) {
      totalEstimate += Number(service.serviceMaster.harga || 0);
    }

    await tx.service.update({
      where: { id: serviceId },
      data: { estimasi_biaya: totalEstimate },
    });

    return totalEstimate;
  }

  /**
   * Get all work order items attached to a specific PKB
   * @param {string|number} serviceId
   */
  async getItemsByServiceId(serviceId) {
    const sId = parseId(serviceId);
    if (!sId) throw new AppError('ID servis tidak valid.', 400);

    const service = await prisma.service.findUnique({
      where: { id: sId },
      include: {
        serviceItems: {
          include: {
            sparepart: true,
            serviceMaster: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!service) throw new AppError('Data antrean servis / PKB tidak ditemukan.', 404);

    return service.serviceItems.map((item) => {
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
        hargaSatuan: Number(item.harga_satuan),
        subtotal: Number(item.subtotal),
        approvalStatus: status,
        isApproved: status === 'DISETUJUI',
        catatan: item.catatan,
        createdAt: item.created_at,
      };
    });
  }

  /**
   * Add a new sparepart or service job item to a PKB
   * Validates warehouse stock availability before requisition
   * By default, status is 'MENUNGGU_KONFIRMASI'
   * @param {string|number} serviceId
   * @param {object} payload
   * @param {object} [user]
   */
  async addServiceItem(serviceId, payload, user = null) {
    if (user) {
      if (user.role === 'KEPALA_BENGKEL') {
        throw new AppError('Kepala Bengkel hanya memiliki hak akses lihat (view-only).', 403);
      }
    }

    const sId = parseId(serviceId);
    if (!sId) throw new AppError('ID servis tidak valid.', 400);

    const {
      itemType,
      sparepartId,
      serviceMasterId,
      quantity = 1,
      approvalStatus = 'MENUNGGU_KONFIRMASI',
      isApproved,
      catatan,
    } = payload;
    const qty = Math.max(1, parseId(quantity) || 1);

    const finalApprovalStatus =
      approvalStatus || (isApproved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');
    const finalIsApproved = finalApprovalStatus === 'DISETUJUI';

    const result = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: { id: sId },
      });
      if (!service) throw new AppError('Data antrean servis / PKB tidak ditemukan.', 404);

      if (
        user &&
        user.role === 'MEKANIK' &&
        service.mechanic_id &&
        service.mechanic_id !== user.mechanicId
      ) {
        throw new AppError(
          'Anda hanya dapat mengisi part/jasa pada motor yang ditugaskan ke Anda.',
          403
        );
      }

      if (service.status === 'Selesai' || service.status === 'Lunas') {
        if (user && user.role === 'MEKANIK') {
          throw new AppError(
            'Servis telah selesai / lulus QC. Mekanik tidak dapat menambah part atau jasa.',
            403
          );
        }
      }

      let namaItem = '';
      let hargaSatuan = 0;
      let targetSparepartId = null;
      let targetServiceMasterId = null;

      if (itemType === 'SPAREPART') {
        targetSparepartId = parseId(sparepartId);
        if (!targetSparepartId) throw new AppError('Suku cadang wajib dipilih.', 400);

        const sparepart = await tx.sparepart.findUnique({
          where: { id: targetSparepartId },
        });

        if (!sparepart) throw new AppError('Suku cadang tidak ditemukan di katalog gudang.', 404);

        // SOP Rule: Validate warehouse stock
        if (sparepart.stok < qty) {
          throw new AppError(
            `Stok suku cadang "${sparepart.nama}" tidak mencukupi (Tersedia: ${sparepart.stok}, Diminta: ${qty}).`,
            400
          );
        }

        namaItem = sparepart.nama;
        hargaSatuan = Number(sparepart.harga_jual);
      } else if (itemType === 'JASA') {
        targetServiceMasterId = parseId(serviceMasterId);
        if (!targetServiceMasterId) throw new AppError('Jasa servis wajib dipilih.', 400);

        const serviceMaster = await tx.serviceMaster.findUnique({
          where: { id: targetServiceMasterId },
        });

        if (!serviceMaster)
          throw new AppError('Paket jasa servis tidak ditemukan di master catalog.', 404);

        namaItem = serviceMaster.nama;
        hargaSatuan = Number(serviceMaster.harga);
      } else {
        throw new AppError('Tipe item tidak valid (Harus SPAREPART atau JASA).', 400);
      }

      const subtotal = Number(hargaSatuan) * qty;

      const createdItem = await tx.serviceItem.create({
        data: {
          service_id: sId,
          item_type: itemType,
          sparepart_id: targetSparepartId,
          service_master_id: targetServiceMasterId,
          nama_item: namaItem,
          quantity: qty,
          harga_satuan: hargaSatuan,
          subtotal,
          approval_status: finalApprovalStatus,
          is_approved: finalIsApproved,
          catatan: catatan ? String(catatan).trim() : null,
        },
        include: {
          sparepart: true,
          serviceMaster: true,
        },
      });

      // Recalculate PKB Estimate
      await this.recalculateServiceEstimate(tx, sId);

      return createdItem;
    });

    const status =
      result.approval_status || (result.is_approved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');
    return {
      id: result.id,
      serviceId: result.service_id,
      itemType: result.item_type,
      sparepartId: result.sparepart_id,
      kodePart: result.sparepart?.kode_part || null,
      namaItem: result.nama_item,
      serviceMasterId: result.service_master_id,
      quantity: result.quantity,
      currentStock: result.sparepart ? result.sparepart.stok : null,
      hargaSatuan: Number(result.harga_satuan),
      subtotal: Number(result.subtotal),
      approvalStatus: status,
      isApproved: status === 'DISETUJUI',
      catatan: result.catatan,
      createdAt: result.created_at,
    };
  }

  /**
   * Update quantity or customer approval status on a work order item
   * @param {string|number} serviceId
   * @param {string|number} itemId
   * @param {object} payload
   */
  async updateServiceItem(serviceId, itemId, payload, user = null) {
    if (user) {
      if (user.role === 'KEPALA_BENGKEL') {
        throw new AppError('Kepala Bengkel hanya memiliki hak akses lihat (view-only).', 403);
      }
    }

    const sId = parseId(serviceId);
    const itId = parseId(itemId);
    if (!sId || !itId) throw new AppError('ID servis atau ID item tidak valid.', 400);

    const { quantity, approvalStatus, isApproved, catatan } = payload;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.serviceItem.findFirst({
        where: { id: itId, service_id: sId },
        include: { sparepart: true, service: true },
      });

      if (!existing) throw new AppError('Item pengerjaan PKB tidak ditemukan.', 404);

      if (
        user &&
        user.role === 'MEKANIK' &&
        existing.service?.mechanic_id &&
        existing.service.mechanic_id !== user.mechanicId
      ) {
        throw new AppError(
          'Anda hanya dapat mengubah item pada motor yang ditugaskan ke Anda.',
          403
        );
      }

      if (existing.service?.status === 'Selesai' || existing.service?.status === 'Lunas') {
        if (user && user.role === 'MEKANIK') {
          throw new AppError(
            'Servis telah selesai / lulus QC. Mekanik tidak dapat mengubah part atau jasa.',
            403
          );
        }
      }

      const updateData = {};

      if (typeof quantity !== 'undefined') {
        const newQty = Math.max(1, parseId(quantity) || 1);
        if (existing.item_type === 'SPAREPART' && existing.sparepart) {
          if (existing.sparepart.stok < newQty) {
            throw new AppError(
              `Stok suku cadang "${existing.sparepart.nama}" tidak mencukupi (Tersedia: ${existing.sparepart.stok}, Diminta: ${newQty}).`,
              400
            );
          }
        }
        updateData.quantity = newQty;
        updateData.subtotal = existing.harga_satuan * newQty;
      }

      if (typeof approvalStatus !== 'undefined') {
        updateData.approval_status = approvalStatus;
        updateData.is_approved = approvalStatus === 'DISETUJUI';
      } else if (typeof isApproved !== 'undefined') {
        updateData.is_approved = Boolean(isApproved);
        updateData.approval_status = isApproved ? 'DISETUJUI' : 'DITOLAK';
      }

      if (typeof catatan !== 'undefined') {
        updateData.catatan = catatan ? String(catatan).trim() : null;
      }

      const updated = await tx.serviceItem.update({
        where: { id: itId },
        data: updateData,
        include: { sparepart: true, serviceMaster: true },
      });

      // Recalculate PKB Estimate
      await this.recalculateServiceEstimate(tx, sId);

      return updated;
    });

    const status =
      result.approval_status || (result.is_approved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');
    return {
      id: result.id,
      serviceId: result.service_id,
      itemType: result.item_type,
      sparepartId: result.sparepart_id,
      kodePart: result.sparepart?.kode_part || null,
      namaItem: result.nama_item,
      serviceMasterId: result.service_master_id,
      quantity: result.quantity,
      currentStock: result.sparepart ? result.sparepart.stok : null,
      hargaSatuan: Number(result.harga_satuan),
      subtotal: Number(result.subtotal),
      approvalStatus: status,
      isApproved: status === 'DISETUJUI',
      catatan: result.catatan,
      createdAt: result.created_at,
    };
  }

  /**
   * Remove a service item from a PKB
   * @param {string|number} serviceId
   * @param {string|number} itemId
   * @param {object} [user]
   */
  async removeServiceItem(serviceId, itemId, user = null) {
    if (user) {
      if (user.role === 'KEPALA_BENGKEL') {
        throw new AppError('Kepala Bengkel hanya memiliki hak akses lihat (view-only).', 403);
      }
    }

    const sId = parseId(serviceId);
    const itId = parseId(itemId);
    if (!sId || !itId) throw new AppError('ID servis atau ID item tidak valid.', 400);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.serviceItem.findFirst({
        where: { id: itId, service_id: sId },
        include: { service: true },
      });

      if (!existing) throw new AppError('Item pengerjaan PKB tidak ditemukan.', 404);

      if (
        user &&
        user.role === 'MEKANIK' &&
        existing.service?.mechanic_id &&
        existing.service.mechanic_id !== user.mechanicId
      ) {
        throw new AppError(
          'Anda hanya dapat menghapus item pada motor yang ditugaskan ke Anda.',
          403
        );
      }

      if (existing.service?.status === 'Selesai' || existing.service?.status === 'Lunas') {
        if (user && user.role === 'MEKANIK') {
          throw new AppError(
            'Servis telah selesai / lulus QC. Mekanik tidak dapat menghapus part atau jasa.',
            403
          );
        }
      }

      await tx.serviceItem.delete({
        where: { id: itId },
      });

      // Recalculate PKB Estimate
      await this.recalculateServiceEstimate(tx, sId);
    });

    return { success: true, message: 'Item berhasil dihapus dari PKB.' };
  }
}

module.exports = new ServiceItemService();
