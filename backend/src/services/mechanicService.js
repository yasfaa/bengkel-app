const prisma = require('../db');

class MechanicService {
  /**
   * Get all mechanics
   */
  async getAllMechanics() {
    return prisma.mechanic.findMany();
  }
}

module.exports = new MechanicService();
