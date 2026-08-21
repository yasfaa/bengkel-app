const prisma = require('../db');
const seedSuppliers = require('./supplierSeed');
const seedMotorMaster = require('./motorMasterSeed');
const seedServiceMaster = require('./serviceMasterSeed');
const seedMechanics = require('./mechanicSeed');
const seedSpareparts = require('./sparepartSeed');
const seedUsers = require('./userSeed');

/**
 * Run all database seeds in dependency order
 */
async function runSeeds() {
  console.log('[Seed] Starting database seeding...');
  await seedSuppliers();
  await seedMotorMaster();
  await seedServiceMaster();
  await seedMechanics();
  await seedSpareparts();
  await seedUsers();
  console.log('[Seed] All database seeds completed successfully.');
}

if (require.main === module) {
  runSeeds()
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

module.exports = runSeeds;
