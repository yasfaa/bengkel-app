const prisma = require('../db');

async function seedMotorMaster() {
  try {
    const capacities = [
      { kapasitas: '110cc' },
      { kapasitas: '125cc' },
      { kapasitas: '150cc' },
      { kapasitas: '155cc' },
      { kapasitas: '160cc' },
      { kapasitas: '250cc' },
      { kapasitas: '300cc' },
    ];

    for (const cap of capacities) {
      await prisma.engineCapacity.upsert({
        where: { kapasitas: cap.kapasitas },
        update: {},
        create: cap,
      });
    }

    const brandDefinitions = [
      {
        nama: 'Honda',
        types: [
          { nama: 'Beat', jenis: 'matic' },
          { nama: 'Vario', jenis: 'matic' },
          { nama: 'Scoopy', jenis: 'matic' },
          { nama: 'PCX', jenis: 'matic' },
          { nama: 'Supra X 125', jenis: 'bebek' },
          { nama: 'Revo', jenis: 'bebek' },
          { nama: 'CB150R', jenis: 'sport' },
          { nama: 'CBR150R', jenis: 'sport' },
        ],
      },
      {
        nama: 'Yamaha',
        types: [
          { nama: 'Mio', jenis: 'matic' },
          { nama: 'NMAX', jenis: 'matic' },
          { nama: 'Aerox', jenis: 'matic' },
          { nama: 'Lexi', jenis: 'matic' },
          { nama: 'XMAX', jenis: 'matic' },
          { nama: 'Jupiter Z', jenis: 'bebek' },
          { nama: 'MX King', jenis: 'bebek' },
          { nama: 'R15', jenis: 'sport' },
        ],
      },
      {
        nama: 'Suzuki',
        types: [
          { nama: 'Address', jenis: 'matic' },
          { nama: 'Nex II', jenis: 'matic' },
          { nama: 'Satria F150', jenis: 'bebek' },
          { nama: 'GSX-R150', jenis: 'sport' },
        ],
      },
      {
        nama: 'Kawasaki',
        types: [
          { nama: 'Ninja 250', jenis: 'sport' },
          { nama: 'KLX 150', jenis: 'sport' },
          { nama: 'W175', jenis: 'sport' },
          { nama: 'D-Tracker 150', jenis: 'sport' },
        ],
      },
    ];

    for (const brandDef of brandDefinitions) {
      const brand = await prisma.motorBrand.upsert({
        where: { nama: brandDef.nama },
        update: {},
        create: { nama: brandDef.nama },
      });

      for (const t of brandDef.types) {
        await prisma.motorType.upsert({
          where: {
            brand_id_nama: {
              brand_id: brand.id,
              nama: t.nama,
            },
          },
          update: {
            jenis: t.jenis,
          },
          create: {
            brand_id: brand.id,
            nama: t.nama,
            jenis: t.jenis,
          },
        });
      }
    }

    console.log('Motor master (brands, types, capacities) seeded successfully.');
  } catch (error) {
    console.error('Failed to seed motor master:', error);
  }
}

module.exports = seedMotorMaster;
