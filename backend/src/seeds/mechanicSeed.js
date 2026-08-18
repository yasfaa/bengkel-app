const prisma = require('../db');

async function seedMechanics() {
  try {
    const count = await prisma.mechanic.count();
    if (count === 0) {
      console.log('Seeding initial mechanics data...');
      await prisma.mechanic.createMany({
        data: [
          { nama: 'Asep', tgl_lahir: new Date('1995-05-10'), waktu_kerja: 'Full-time (08:00 - 17:00)' },
          { nama: 'Budi', tgl_lahir: new Date('1996-08-15'), waktu_kerja: 'Full-time (08:00 - 17:00)' },
          { nama: 'Cecep', tgl_lahir: new Date('1997-12-20'), waktu_kerja: 'Full-time (08:00 - 17:00)' },
          { nama: 'Dedi', tgl_lahir: new Date('1998-03-05'), waktu_kerja: 'Part-time (13:00 - 18:00)' },
        ],
      });
      console.log('Initial mechanics seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed mechanics:', error);
  }
}

module.exports = seedMechanics;
