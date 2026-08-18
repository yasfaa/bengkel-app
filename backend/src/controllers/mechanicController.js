const mechanicService = require('../services/mechanicService');
const asyncHandler = require('../utils/asyncHandler');

class MechanicController {
  // GET /api/mechanics
  getAllMechanics = asyncHandler(async (req, res) => {
    const mechanics = await mechanicService.getAllMechanics();
    res.status(200).json(mechanics);
  });
}

module.exports = new MechanicController();
