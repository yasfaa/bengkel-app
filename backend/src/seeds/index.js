const seedMotorMaster = require('./motorMasterSeed');
const seedServiceMaster = require('./serviceMasterSeed');
const seedMechanics = require('./mechanicSeed');

/**
 * Run all database seeds
 */
async function runSeeds() {
  await seedMotorMaster();
  await seedServiceMaster();
  await seedMechanics();
}

module.exports = runSeeds;
