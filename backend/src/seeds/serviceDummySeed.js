const prisma = require('../db');

async function seedDummyServices() {
  try {
    const mechanics = await prisma.mechanic.findMany({ include: { user: true } });
    const serviceMasters = await prisma.serviceMaster.findMany();

    // Create dummy customers and vehicles if not exist
    let customers = await prisma.customer.findMany();
    if (customers.length === 0) {
      await prisma.customer.createMany({
        data: [
          { nama: 'Budi Santoso', telepon: '081234567890', alamat: 'Jl. Merdeka No. 1' },
          { nama: 'Andi Wijaya', telepon: '089876543210', alamat: 'Jl. Sudirman No. 2' },
          { nama: 'Siti Aminah', telepon: '085612349876', alamat: 'Jl. Thamrin No. 3' },
        ],
      });
      customers = await prisma.customer.findMany();
    }

    let vehicles = await prisma.vehicle.findMany({ include: { customer: true } });
    if (vehicles.length === 0) {
      const motorTypes = await prisma.motorType.findMany();
      const capacities = await prisma.engineCapacity.findMany();
      if (motorTypes.length > 0 && capacities.length > 0) {
        await prisma.vehicle.createMany({
          data: [
            {
              customer_id: customers[0].id,
              nopol: 'B 1234 ABC',
              motor_type_id: motorTypes[0].id,
              engine_capacity_id: capacities[0].id,
              warna: 'Hitam',
              tahun_pembuatan: 2020,
            },
            {
              customer_id: customers[1].id,
              nopol: 'D 5678 DEF',
              motor_type_id: motorTypes[1 % motorTypes.length].id,
              engine_capacity_id: capacities[1 % capacities.length].id,
              warna: 'Merah',
              tahun_pembuatan: 2021,
            },
            {
              customer_id: customers[2].id,
              nopol: 'Z 9012 GHI',
              motor_type_id: motorTypes[2 % motorTypes.length].id,
              engine_capacity_id: capacities[2 % capacities.length].id,
              warna: 'Putih',
              tahun_pembuatan: 2022,
            },
          ],
        });
        vehicles = await prisma.vehicle.findMany({ include: { customer: true } });
      }
    }

    if (mechanics.length === 0 || serviceMasters.length === 0 || vehicles.length === 0) {
      console.log('Skipping dummy services, insufficient master data.');
      return;
    }

    // Only active services in progress / waiting (NO Selesai / Belum Lunas)
    const dummyServices = [
      {
        nomor_pkb: 'PKB-1001',
        vehicle_id: vehicles[0].id,
        service_master_id: serviceMasters[0].id,
        status: 'Dikerjakan', // Active job for Asep (mechanics[0])
        mechanic_id: mechanics[0].id,
        keluhan: 'Tarikan gas berat dan CVT getar saat putaran awal',
        estimasi_biaya: serviceMasters[0].harga,
        km_masuk: 12000,
        level_bensin: '1/2',
        tgl_masuk: new Date(),
      },
      {
        nomor_pkb: 'PKB-1002',
        vehicle_id: vehicles[1 % vehicles.length].id,
        service_master_id: serviceMasters[1 % serviceMasters.length].id,
        status: 'Menunggu', // Waiting with assigned mechanic Budi (mechanics[1])
        mechanic_id: mechanics[1]?.id || null,
        keluhan: 'Rem depan bunyi berdecit saat pengereman mendadak',
        estimasi_biaya: serviceMasters[1 % serviceMasters.length].harga,
        km_masuk: 15500,
        level_bensin: 'Full',
        tgl_masuk: new Date(),
      },
      {
        nomor_pkb: 'PKB-1003',
        vehicle_id: vehicles[2 % vehicles.length].id,
        service_master_id: serviceMasters[2 % serviceMasters.length].id,
        status: 'Menunggu', // Waiting in queue (no mechanic assigned yet)
        mechanic_id: null,
        keluhan: 'Ganti oli mesin & oli gardan rutin 2000 km',
        estimasi_biaya: serviceMasters[2 % serviceMasters.length].harga,
        km_masuk: 21000,
        level_bensin: '1/4',
        tgl_masuk: new Date(),
      },
    ];

    for (const data of dummyServices) {
      const existing = await prisma.service.findFirst({ where: { nomor_pkb: data.nomor_pkb } });
      if (!existing) {
        await prisma.service.create({ data });
      } else {
        await prisma.service.update({ where: { id: existing.id }, data });
      }
    }

    console.log(
      'Dummy services seeded successfully. Only active queue & work in progress (no finished/unpaid).'
    );
  } catch (error) {
    console.error('Failed to seed dummy services:', error);
  }
}

module.exports = seedDummyServices;
