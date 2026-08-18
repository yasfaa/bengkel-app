const prisma = require('../db');

async function seedSpareparts() {
  try {
    const suppliers = await prisma.supplier.findMany();
    const supMap = {};
    suppliers.forEach((s) => {
      supMap[s.nama] = s.id;
    });

    const spareparts = [
      {
        kode_part: 'AHM-MPX2-08L',
        nama: 'Oli Mesin AHM MPX2 0.8L (Matic)',
        kategori: 'OLI',
        stok: 24,
        min_stok: 6,
        harga_beli: 40000,
        harga_jual: 52000,
        supplier_id: supMap['PT Astra Otoparts'] || null,
      },
      {
        kode_part: 'YMH-YML-08L',
        nama: 'Oli Mesin Yamalube Matic 0.8L',
        kategori: 'OLI',
        stok: 18,
        min_stok: 6,
        harga_beli: 41000,
        harga_jual: 54000,
        supplier_id: supMap['Yamaha Indonesia Motor Mfg'] || null,
      },
      {
        kode_part: 'AHM-KAMPAS-VARIO',
        nama: 'Kampas Rem Depan Vario (AHM)',
        kategori: 'FAST_MOVING',
        stok: 8,
        min_stok: 4,
        harga_beli: 28000,
        harga_jual: 38000,
        supplier_id: supMap['PT Astra Otoparts'] || null,
      },
      {
        kode_part: 'YMH-BELT-NMAX',
        nama: 'V-Belt Kit NMAX (Yamaha)',
        kategori: 'FAST_MOVING',
        stok: 5,
        min_stok: 3,
        harga_beli: 110000,
        harga_jual: 145000,
        supplier_id: supMap['Yamaha Indonesia Motor Mfg'] || null,
      },
      {
        kode_part: 'IRC-BAN-909014',
        nama: 'Ban Luar IRC 90/90-14 Tubeless',
        kategori: 'BAN',
        stok: 4,
        min_stok: 2,
        harga_beli: 135000,
        harga_jual: 175000,
        supplier_id: supMap['PT Gajah Tunggal Tbk'] || null,
      },
      {
        kode_part: 'NGK-BUSI-CPR9',
        nama: 'Busi NGK CPR9EA-9',
        kategori: 'FAST_MOVING',
        stok: 15,
        min_stok: 5,
        harga_beli: 15000,
        harga_jual: 25000,
        supplier_id: supMap['PT NGK Busi Indonesia'] || null,
      },
    ];

    for (const part of spareparts) {
      await prisma.sparepart.upsert({
        where: { kode_part: part.kode_part },
        update: {
          nama: part.nama,
          kategori: part.kategori,
          stok: part.stok,
          min_stok: part.min_stok,
          harga_beli: part.harga_beli,
          harga_jual: part.harga_jual,
          supplier_id: part.supplier_id,
        },
        create: part,
      });
    }

    console.log('Spareparts data seeded with Supplier relations successfully.');
  } catch (error) {
    console.error('Failed to seed spareparts:', error);
  }
}

module.exports = seedSpareparts;
