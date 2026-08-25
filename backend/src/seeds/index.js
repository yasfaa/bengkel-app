const prisma = require('../db');
const seedSuppliers = require('./supplierSeed');
const seedMotorMaster = require('./motorMasterSeed');
const seedServiceMaster = require('./serviceMasterSeed');
const seedMechanics = require('./mechanicSeed');
const seedSpareparts = require('./sparepartSeed');
const seedUsers = require('./userSeed');
const seedDummyServices = require('./serviceDummySeed');

/**
 * Run master data seeds (Catalogs & Core Data)
 */
async function runMasterSeeds() {
  console.log('[Seed] Starting MASTER data seeding...');
  // Users (Admin) diperlukan untuk login pertama kali
  await seedUsers();
  // Data Master Motor (seperti yang diminta)
  await seedMotorMaster();
  // Master Service, Supplier, dan Spareparts (katalog dasar)
  await seedServiceMaster();
  await seedSuppliers();
  await seedSpareparts();
  console.log('[Seed] MASTER data seeds completed successfully.');
}

/**
 * Run dummy/operational data seeds
 */
async function runDummySeeds() {
  console.log('[Seed] Starting DUMMY data seeding...');
  // Data mekanik (opsional/dummy untuk testing)
  await seedMechanics();
  // Data antrean/servis dummy agar bisa langsung dites di frontend
  await seedDummyServices();
  console.log('[Seed] DUMMY data seeds completed successfully.');
}

/**
 * Run all database seeds in dependency order
 */
async function runSeeds(type = 'all') {
  if (type === 'master' || type === 'all') {
    await runMasterSeeds();
  }
  if (type === 'dummy' || type === 'all') {
    await runDummySeeds();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let seedType = 'all';

  if (args.includes('--master')) {
    seedType = 'master';
  } else if (args.includes('--dummy')) {
    seedType = 'dummy';
  }

  console.log(`[Seed] Running in mode: ${seedType}`);
  runSeeds(seedType)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('[Seed Error]:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  runSeeds,
  runMasterSeeds,
  runDummySeeds,
};
