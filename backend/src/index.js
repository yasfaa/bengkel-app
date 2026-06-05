const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./db');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use('/api', serviceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend BengkelKu is running.' });
});

// Auto seed mechanics function
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
        ]
      });
      console.log('Initial mechanics seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed mechanics:', error);
  }
}

async function seedMotorMaster() {
  try {
    const brandCount = await prisma.motorBrand.count();
    const capacityCount = await prisma.engineCapacity.count();

    if (brandCount === 0) {
      console.log('Seeding initial motor master data...');

      const brandDefinitions = [
        {
          nama: 'Honda',
          types: ['Beat', 'Vario', 'Scoopy', 'PCX', 'CB150R'],
        },
        {
          nama: 'Yamaha',
          types: ['Mio', 'NMAX', 'Aerox', 'Lexi', 'XMAX'],
        },
        {
          nama: 'Suzuki',
          types: ['Address', 'Nex II', 'Satria F150', 'GSX-R150'],
        },
        {
          nama: 'Kawasaki',
          types: ['Ninja 250', 'KLX 150', 'W175', 'D-Tracker 150'],
        },
      ];

      const brandRecords = {};

      for (const brandDefinition of brandDefinitions) {
        const brand = await prisma.motorBrand.upsert({
          where: { nama: brandDefinition.nama },
          update: {},
          create: { nama: brandDefinition.nama },
        });

        brandRecords[brand.nama] = brand;
      }

      const typeRows = brandDefinitions.flatMap((brandDefinition) => {
        const brand = brandRecords[brandDefinition.nama];
        return brandDefinition.types.map((typeName) => ({
          nama: typeName,
          brand_id: brand.id,
        }));
      });

      await prisma.motorType.createMany({
        data: typeRows,
        skipDuplicates: true,
      });

      console.log('Initial motor master data seeded successfully.');
    }

    if (capacityCount === 0) {
      await prisma.engineCapacity.createMany({
        data: [
          { kapasitas: '110cc' },
          { kapasitas: '125cc' },
          { kapasitas: '150cc' },
          { kapasitas: '155cc' },
          { kapasitas: '160cc' },
          { kapasitas: '250cc' },
          { kapasitas: '300cc' },
        ],
        skipDuplicates: true,
      });

      console.log('Initial engine capacity master data seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed motor master:', error);
  }
}

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

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await seedMotorMaster();
  await seedServiceMaster();
  await seedMechanics();
});

