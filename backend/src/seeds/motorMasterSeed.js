const prisma = require('../db');

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

module.exports = seedMotorMaster;
