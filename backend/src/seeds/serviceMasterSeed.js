const prisma = require('../db');

async function seedServiceMaster() {
  try {
    const count = await prisma.serviceMaster.count();
    if (count === 0) {
      console.log('Seeding initial service master data...');
      await prisma.serviceMaster.createMany({
        data: [
          { nama: 'Servis Ringan', harga: 50000, deskripsi: 'Perawatan dasar dan pengecekan umum.' },
          { nama: 'Servis Lengkap', harga: 100000, deskripsi: 'Pengecekan menyeluruh dan penyetelan utama.' },
          { nama: 'Turun Mesin Ringan', harga: 150000, deskripsi: 'Servis berat untuk gangguan tertentu.' },
          { nama: 'Ganti Oli', harga: 30000, deskripsi: 'Jasa penggantian oli mesin.' },
          { nama: 'Tune Up', harga: 75000, deskripsi: 'Penyetelan performa mesin.' },
        ],
      });
      console.log('Initial service master seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed service master:', error);
  }
}

module.exports = seedServiceMaster;
