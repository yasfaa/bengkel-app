const prisma = require('../db');

async function seedSuppliers() {
  try {
    const suppliers = [
      {
        nama: 'PT Astra Otoparts',
        telepon: '021-4603550',
        alamat: 'Jl. Pegangsaan Dua Km 2.2, Kelapa Gading, Jakarta Utara',
      },
      {
        nama: 'Yamaha Indonesia Motor Mfg',
        telepon: '021-4618000',
        alamat: 'Jl. DR. KRT. Radjiman Widyodiningrat, Pulo Gadung, Jakarta Timur',
      },
      {
        nama: 'PT Gajah Tunggal Tbk',
        telepon: '021-3805916',
        alamat: 'Wisma Hayam Wuruk Lt. 10, Jakarta Pusat',
      },
      {
        nama: 'PT NGK Busi Indonesia',
        telepon: '021-8711075',
        alamat: 'Jl. Raya Bogor Km 26.6, Ciracas, Jakarta Timur',
      },
    ];

    for (const sup of suppliers) {
      await prisma.supplier.upsert({
        where: { nama: sup.nama },
        update: { telepon: sup.telepon, alamat: sup.alamat },
        create: sup,
      });
    }

    console.log('Suppliers seeded successfully.');
  } catch (error) {
    console.error('Failed to seed suppliers:', error);
  }
}

module.exports = seedSuppliers;
