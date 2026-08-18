const mechanicService = require('../services/mechanicService');
const asyncHandler = require('../utils/asyncHandler');

class MechanicController {
  // GET /api/mechanics
  getAllMechanics = asyncHandler(async (req, res) => {
    const mechanics = await mechanicService.getAllMechanics();
    res.status(200).json(mechanics);
  });

  // GET /api/mechanics/:id
  getMechanicById = asyncHandler(async (req, res) => {
    const mechanic = await mechanicService.getMechanicById(req.params.id);
    res.status(200).json(mechanic);
  });

  // POST /api/mechanics
  createMechanic = asyncHandler(async (req, res) => {
    const created = await mechanicService.createMechanic(req.body);
    res.status(201).json(created);
  });

  // PATCH /api/mechanics/:id
  updateMechanic = asyncHandler(async (req, res) => {
    const updated = await mechanicService.updateMechanic(req.params.id, req.body);
    res.status(200).json(updated);
  });

  // DELETE /api/mechanics/:id
  deleteMechanic = asyncHandler(async (req, res) => {
    await mechanicService.deleteMechanic(req.params.id);
    res.status(204).send();
  });
}

module.exports = new MechanicController();
