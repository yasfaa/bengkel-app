const bcrypt = require('bcryptjs');
const prisma = require('../db');

async function seedUsers() {
  try {
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordKepala = await bcrypt.hash('kepala123', 10);

    const users = [
      {
        username: 'admin',
        password: passwordAdmin,
        nama: 'Service Advisor & Admin',
        email: 'admin@bengkelku.id',
        role: 'ADMIN',
        tgl_masuk: new Date('2022-01-01'),
      },
      {
        username: 'kepala',
        password: passwordKepala,
        nama: 'Bambang Sudibyo (Kepala Bengkel)',
        email: 'kepala@bengkelku.id',
        role: 'KEPALA_BENGKEL',
        tgl_masuk: new Date('2021-06-01'),
      },
    ];

    for (const u of users) {
      const user = await prisma.user.findUnique({ where: { username: u.username } });
      if (!user) {
        await prisma.user.create({ data: u });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: u.role,
            nama: u.nama,
            email: u.email,
            is_active: true,
          },
        });
      }
    }

    console.log('Default admin & kepala bengkel user accounts seeded successfully.');
  } catch (error) {
    console.error('Failed to seed users:', error);
  }
}

module.exports = seedUsers;
