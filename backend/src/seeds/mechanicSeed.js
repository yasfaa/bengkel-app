const prisma = require('../db');

async function seedMechanics() {
  try {
    const mechanics = [
      {
        nama: 'Asep',
        tgl_lahir: new Date('1995-05-10'),
        waktu_kerja: 'Full-time (08:00 - 17:00)',
        spesialisasi: 'Mesin & CVT',
      },
      {
        nama: 'Budi',
        tgl_lahir: new Date('1996-08-15'),
        waktu_kerja: 'Full-time (08:00 - 17:00)',
        spesialisasi: 'Kelistrikan & Injeksi',
      },
      {
        nama: 'Cecep',
        tgl_lahir: new Date('1997-12-20'),
        waktu_kerja: 'Full-time (08:00 - 17:00)',
        spesialisasi: 'Servis Ringan & Tune Up',
      },
      {
        nama: 'Dedi',
        tgl_lahir: new Date('1998-03-05'),
        waktu_kerja: 'Part-time (13:00 - 18:00)',
        spesialisasi: 'Overhaul & Kaki-kaki',
      },
    ];

    for (const mech of mechanics) {
      const existing = await prisma.mechanic.findFirst({ where: { nama: mech.nama } });
      if (!existing) {
        await prisma.mechanic.create({ data: mech });
      } else {
        await prisma.mechanic.update({
          where: { id: existing.id },
          data: {
            spesialisasi: mech.spesialisasi,
            waktu_kerja: mech.waktu_kerja,
          },
        });
      }
    }

    console.log('Initial mechanics seeded successfully.');
  } catch (error) {
    console.error('Failed to seed mechanics:', error);
  }
}

module.exports = seedMechanics;
