const seedSuppliers = require('./supplierSeed');
const seedMotorMaster = require('./motorMasterSeed');
const seedServiceMaster = require('./serviceMasterSeed');
const seedMechanics = require('./mechanicSeed');
const seedSpareparts = require('./sparepartSeed');

/**
 * Run all database seeds in dependency order
 */
async function runSeeds() {
  await seedSuppliers();
  await seedMotorMaster();
  await seedServiceMaster();
  await seedMechanics();
  await seedSpareparts();
}

module.exports = runSeeds;
