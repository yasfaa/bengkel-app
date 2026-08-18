const prisma = require('../db');

async function seedServiceMaster() {
  try {
    const services = [
      {
        nama: 'Servis Ringan',
        harga: 50000,
        deskripsi: 'Pengecekan umum, pembersihan filter, dan penyetelan stasioner.',
        estimasi_durasi: 30,
        kategori: 'RINGAN',
      },
      {
        nama: 'Servis Lengkap',
        harga: 100000,
        deskripsi: 'Pengecekan menyeluruh sistem injeksi/karburator, CVT/rantai, dan kelistrikan.',
        estimasi_durasi: 60,
        kategori: 'LENGKAP',
      },
      {
        nama: 'Ganti Oli Mesin / Gardan',
        harga: 25000,
        deskripsi: 'Jasa penggantian oli mesin dan oli transmisi/gardan.',
        estimasi_durasi: 15,
        kategori: 'OLI',
      },
      {
        nama: 'Tune Up Injeksi & Gurah Mesin',
        harga: 85000,
        deskripsi: 'Pembersihan throttle body, ruang bakar, dan reset ECU.',
        estimasi_durasi: 45,
        kategori: 'TUNE_UP',
      },
      {
        nama: 'Servis CVT & Pembersihan Pulley',
        harga: 60000,
        deskripsi: 'Pembersihan mangkok CVT, roller, vanbelt, dan pelumasan grease.',
        estimasi_durasi: 45,
        kategori: 'RINGAN',
      },
      {
        nama: 'Turun Mesin Ringan (Top Overhaul)',
        harga: 175000,
        deskripsi: 'Skir klep, ganti ring piston, dan pembersihan kerak kepala silinder.',
        estimasi_durasi: 180,
        kategori: 'BERAT',
      },
    ];

    for (const service of services) {
      await prisma.serviceMaster.upsert({
        where: { nama: service.nama },
        update: {
          harga: service.harga,
          deskripsi: service.deskripsi,
          estimasi_durasi: service.estimasi_durasi,
          kategori: service.kategori,
        },
        create: {
          nama: service.nama,
          harga: service.harga,
          deskripsi: service.deskripsi,
          estimasi_durasi: service.estimasi_durasi,
          kategori: service.kategori,
          is_active: true,
        },
      });
    }

    console.log('Initial service master data seeded successfully.');
  } catch (error) {
    console.error('Failed to seed service master:', error);
  }
}

module.exports = seedServiceMaster;
