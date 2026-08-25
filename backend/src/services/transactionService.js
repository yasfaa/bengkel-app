const prisma = require('../db');
const AppError = require('../utils/appError');

class TransactionService {
  /**
   * Helper formatting helper to safely convert Decimal values to Number
   */
  formatTransaction(trx) {
    if (!trx) return null;
    return {
      id: trx.id,
      noInvoice: trx.no_invoice,
      nomorInvoice: trx.no_invoice,
      serviceId: trx.service_id,
      totalJasa: Number(trx.total_jasa || 0),
      totalSparepart: Number(trx.total_sparepart || 0),
      diskon: Number(trx.diskon || 0),
      total: Number(trx.total || 0),
      totalGross: Number(trx.total_jasa || 0) + Number(trx.total_sparepart || 0),
      uangDiterima: Number(trx.uang_diterima || 0),
      kembalian: Number(trx.kembalian || 0),
      tglBayar: trx.tgl_bayar,
      metodeBayar: trx.metode_bayar,
      catatan: trx.catatan || null,
      kasir: trx.kasir
        ? {
            id: trx.kasir.id,
            nama: trx.kasir.nama,
            username: trx.kasir.username,
            role: trx.kasir.role,
          }
        : null,
      service: trx.service
        ? {
            id: trx.service.id,
            nomorPkb: trx.service.nomor_pkb,
            status: trx.service.status,
            keluhan: trx.service.keluhan,
            kmMasuk: trx.service.km_masuk,
            levelBensin: trx.service.level_bensin,
            tglMasuk: trx.service.tgl_masuk,
            tglSelesai: trx.service.tgl_selesai,
            basePackageName: trx.service.serviceMaster?.nama || 'Servis Standar',
            basePackagePrice: Number(trx.service.serviceMaster?.harga || 0),
            nopol: trx.service.vehicle?.nopol,
            customerName: trx.service.vehicle?.customer?.nama,
            phone: trx.service.vehicle?.customer?.telepon,
            alamat: trx.service.vehicle?.customer?.alamat,
            motorType: trx.service.vehicle?.motorType
              ? `${trx.service.vehicle.motorType.brand?.nama || ''} ${trx.service.vehicle.motorType.nama}`
              : null,
            warna: trx.service.vehicle?.warna,
            tahunPembuatan: trx.service.vehicle?.tahun_pembuatan,
            mechanicName: trx.service.mechanic?.user?.nama || 'Teknisi Umum',
            serviceItems: trx.service.serviceItems
              ? trx.service.serviceItems.map((it) => ({
                  id: it.id,
                  itemType: it.item_type,
                  namaItem: it.nama_item,
                  quantity: it.quantity,
                  hargaSatuan: Number(it.harga_satuan),
                  subtotal: Number(it.subtotal),
                  approvalStatus: it.approval_status,
                  isApproved: it.is_approved,
                  catatan: it.catatan,
                }))
              : [],
          }
        : null,
      // Flattened metadata for fast table rendering
      nomorPkb: trx.service?.nomor_pkb || null,
      nopol: trx.service?.vehicle?.nopol || '-',
      customerName: trx.service?.vehicle?.customer?.nama || '-',
      phone: trx.service?.vehicle?.customer?.telepon || '-',
      createdAt: trx.created_at,
      updatedAt: trx.updated_at,
    };
  }

  /**
   * Generate consecutive daily invoice number in format INV-YYMMDD-XXX
   * e.g. INV-260825-001
   */
  async generateInvoiceNumber(tx) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `INV-${yy}${mm}${dd}-`;

    const countToday = await tx.transaction.count({
      where: {
        no_invoice: {
          startsWith: datePrefix,
        },
      },
    });

    const nextSeq = String(countToday + 1).padStart(3, '0');
    return `${datePrefix}${nextSeq}`;
  }

  /**
   * Process cashier payment and atomic inventory deduction
   */
  async createTransaction(data, user) {
    const { serviceId, metodeBayar, catatan } = data;
    const diskon = Number(data.diskon || 0);
    let uangDiterima = Number(data.uangDiterima || 0);

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Service and full metadata
      const service = await tx.service.findUnique({
        where: { id: serviceId },
        include: {
          serviceMaster: true,
          serviceItems: {
            include: {
              sparepart: true,
              serviceMaster: true,
            },
          },
          vehicle: {
            include: {
              customer: true,
              motorType: { include: { brand: true } },
              engineCapacity: true,
            },
          },
          mechanic: { include: { user: true } },
          transactions: true,
        },
      });

      if (!service) {
        throw new AppError('Data servis (PKB) tidak ditemukan.', 404);
      }

      if (service.status !== 'Selesai') {
        throw new AppError(
          `Servis ini belum selesai (Status saat ini: ${service.status}). Mohon selesaikan pengerjaan dan QC terlebih dahulu.`,
          400
        );
      }

      if (service.transactions && service.transactions.length > 0) {
        throw new AppError(
          `Servis ini sudah pernah dibayar dengan Nomor Invoice: ${service.transactions[0].no_invoice}.`,
          400
        );
      }

      // 2. Compute Total Jasa (Base Package + Extra Approved Services)
      const basePackagePrice = Number(service.serviceMaster?.harga || 0);
      let extraJasa = 0;
      let totalSparepart = 0;

      for (const item of service.serviceItems) {
        if (item.is_approved) {
          if (item.item_type === 'JASA') {
            extraJasa += Number(item.subtotal || 0);
          } else if (item.item_type === 'SPAREPART') {
            totalSparepart += Number(item.subtotal || 0);

            // 3. Validate and atomically deduct stock
            if (item.sparepart_id) {
              const part = await tx.sparepart.findUnique({
                where: { id: item.sparepart_id },
              });

              if (!part) {
                throw new AppError(
                  `Suku cadang "${item.nama_item}" tidak ditemukan di database gudang.`,
                  404
                );
              }

              if (part.stok < item.quantity) {
                throw new AppError(
                  `Stok suku cadang "${part.nama}" (${part.kode_part}) tidak mencukupi untuk pembayaran kasir. Tersedia: ${part.stok}, Dibutuhkan: ${item.quantity}.`,
                  400
                );
              }

              // Atomically reduce stock
              await tx.sparepart.update({
                where: { id: item.sparepart_id },
                data: {
                  stok: { decrement: item.quantity },
                },
              });
            }
          }
        }
      }

      const totalJasa = basePackagePrice + extraJasa;
      const totalGross = totalJasa + totalSparepart;
      const grandTotal = Math.max(0, totalGross - diskon);

      // 4. Validate Cash Payment & Compute Change
      let kembalian = 0;
      if (metodeBayar === 'Tunai') {
        if (uangDiterima < grandTotal) {
          throw new AppError(
            `Nominal uang tunai yang diterima (Rp ${uangDiterima.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${grandTotal.toLocaleString('id-ID')}).`,
            400
          );
        }
        kembalian = uangDiterima - grandTotal;
      } else {
        uangDiterima = grandTotal;
        kembalian = 0;
      }

      // 5. Generate consecutive invoice number (INV-YYMMDD-XXX)
      const noInvoice = await this.generateInvoiceNumber(tx);

      // 6. Create Transaction
      const createdTrx = await tx.transaction.create({
        data: {
          no_invoice: noInvoice,
          service_id: service.id,
          total_jasa: totalJasa,
          total_sparepart: totalSparepart,
          diskon: diskon,
          total: grandTotal,
          uang_diterima: uangDiterima,
          kembalian: kembalian,
          metode_bayar: metodeBayar,
          kasir_id: user?.id || null,
          catatan: catatan || null,
        },
        include: {
          kasir: { select: { id: true, nama: true, username: true, role: true } },
          service: {
            include: {
              serviceMaster: true,
              serviceItems: {
                include: {
                  sparepart: true,
                  serviceMaster: true,
                },
              },
              vehicle: {
                include: {
                  customer: true,
                  motorType: { include: { brand: true } },
                  engineCapacity: true,
                },
              },
              mechanic: { include: { user: true } },
            },
          },
        },
      });

      return this.formatTransaction(createdTrx);
    });
  }

  /**
   * Get list of all transactions with optional search and filtering
   */
  async getAllTransactions(query = {}) {
    const { search, metodeBayar } = query;
    const where = {};

    if (metodeBayar) {
      where.metode_bayar = metodeBayar;
    }

    if (search) {
      where.OR = [
        { no_invoice: { contains: search } },
        {
          service: {
            vehicle: {
              nopol: { contains: search },
            },
          },
        },
        {
          service: {
            vehicle: {
              customer: {
                nama: { contains: search },
              },
            },
          },
        },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { tgl_bayar: 'desc' },
      include: {
        kasir: { select: { id: true, nama: true, username: true, role: true } },
        service: {
          include: {
            serviceMaster: true,
            serviceItems: true,
            vehicle: {
              include: {
                customer: true,
                motorType: { include: { brand: true } },
                engineCapacity: true,
              },
            },
            mechanic: { include: { user: true } },
          },
        },
      },
    });

    return transactions.map((t) => this.formatTransaction(t));
  }

  /**
   * Get single transaction detail by ID
   */
  async getTransactionById(id) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: {
        kasir: { select: { id: true, nama: true, username: true, role: true } },
        service: {
          include: {
            serviceMaster: true,
            serviceItems: {
              include: {
                sparepart: true,
                serviceMaster: true,
              },
            },
            vehicle: {
              include: {
                customer: true,
                motorType: { include: { brand: true } },
                engineCapacity: true,
              },
            },
            mechanic: { include: { user: true } },
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaksi invoice tidak ditemukan.', 404);
    }

    return this.formatTransaction(transaction);
  }

  /**
   * Get all completed services that are waiting for payment at Cashier
   */
  async getUnpaidCompletedServices() {
    const services = await prisma.service.findMany({
      where: {
        status: 'Selesai',
        transactions: { none: {} },
      },
      orderBy: { tgl_selesai: 'asc' },
      include: {
        serviceMaster: true,
        serviceItems: {
          include: {
            sparepart: true,
            serviceMaster: true,
          },
        },
        vehicle: {
          include: {
            customer: true,
            motorType: { include: { brand: true } },
            engineCapacity: true,
          },
        },
        mechanic: { include: { user: true } },
        serviceQC: true,
      },
    });

    return services.map((s) => {
      const basePackagePrice = Number(s.serviceMaster?.harga || 0);
      let extraJasa = 0;
      let totalPart = 0;

      const approvedItems = (s.serviceItems || []).filter((it) => it.is_approved);
      for (const it of approvedItems) {
        if (it.item_type === 'JASA') {
          extraJasa += Number(it.subtotal || 0);
        } else if (it.item_type === 'SPAREPART') {
          totalPart += Number(it.subtotal || 0);
        }
      }

      const totalJasa = basePackagePrice + extraJasa;
      const grandTotal = totalJasa + totalPart;

      return {
        id: s.id,
        nomorPkb: s.nomor_pkb,
        status: s.status,
        keluhan: s.keluhan,
        tglMasuk: s.tgl_masuk,
        tglSelesai: s.tgl_selesai,
        nopol: s.vehicle?.nopol,
        customerName: s.vehicle?.customer?.nama,
        phone: s.vehicle?.customer?.telepon,
        motorType: s.vehicle?.motorType
          ? `${s.vehicle.motorType.brand?.nama || ''} ${s.vehicle.motorType.nama}`
          : null,
        mechanicName: s.mechanic?.user?.nama || 'Teknisi Umum',
        basePackageName: s.serviceMaster?.nama || 'Servis Standar',
        basePackagePrice,
        totalJasa,
        totalSparepart: totalPart,
        grandTotal,
        itemsCount: approvedItems.length,
        approvedItems: approvedItems.map((it) => ({
          id: it.id,
          itemType: it.item_type,
          namaItem: it.nama_item,
          quantity: it.quantity,
          hargaSatuan: Number(it.harga_satuan),
          subtotal: Number(it.subtotal),
        })),
      };
    });
  }
}

module.exports = new TransactionService();
