const bcrypt = require('bcryptjs');
const prisma = require('../db');

async function seedMechanics() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    const asepPassword = await bcrypt.hash('asep123', 10);
    const budiPassword = await bcrypt.hash('budi123', 10);

    const mechanics = [
      {
        username: 'asep',
        password: asepPassword,
        nama: 'Asep Hidayat',
        email: 'asep@bengkelku.id',
        tgl_lahir: new Date('1995-05-10'),
        tgl_masuk: new Date('2023-01-15'),
        spesialisasi: 'Mesin & CVT',
      },
      {
        username: 'budi',
        password: budiPassword,
        nama: 'Budi Santoso',
        email: 'budi@bengkelku.id',
        tgl_lahir: new Date('1996-08-15'),
        tgl_masuk: new Date('2023-06-01'),
        spesialisasi: 'Kelistrikan & Injeksi',
      },
      {
        username: 'cecep',
        password: passwordHash,
        nama: 'Cecep Supriadi',
        email: 'cecep@bengkelku.id',
        tgl_lahir: new Date('1997-12-20'),
        tgl_masuk: new Date('2024-02-10'),
        spesialisasi: 'Servis Ringan & Tune Up',
      },
      {
        username: 'dedi',
        password: passwordHash,
        nama: 'Dedi Kurniawan',
        email: 'dedi@bengkelku.id',
        tgl_lahir: new Date('1998-03-05'),
        tgl_masuk: new Date('2024-05-20'),
        spesialisasi: 'Overhaul & Kaki-kaki',
      },
    ];

    for (const mech of mechanics) {
      let user = await prisma.user.findUnique({ where: { username: mech.username } });
      if (!user) {
        user = await txOrPrisma(prisma).user.create({
          data: {
            username: mech.username,
            password: mech.password,
            nama: mech.nama,
            email: mech.email,
            tgl_lahir: mech.tgl_lahir,
            tgl_masuk: mech.tgl_masuk,
            role: 'MEKANIK',
            is_active: true,
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            nama: mech.nama,
            email: mech.email,
            tgl_lahir: mech.tgl_lahir,
            tgl_masuk: mech.tgl_masuk,
            role: 'MEKANIK',
            is_active: true,
          },
        });
      }

      const existingMech = await prisma.mechanic.findUnique({ where: { user_id: user.id } });
      if (!existingMech) {
        await prisma.mechanic.create({
          data: {
            user_id: user.id,
            spesialisasi: mech.spesialisasi,
            is_active: true,
          },
        });
      } else {
        await prisma.mechanic.update({
          where: { id: existingMech.id },
          data: {
            spesialisasi: mech.spesialisasi,
            is_active: true,
          },
        });
      }
    }

    console.log('Initial mechanics and their user accounts seeded successfully.');
  } catch (error) {
    console.error('Failed to seed mechanics:', error);
  }
}

function txOrPrisma(p) {
  return p;
}

module.exports = seedMechanics;
