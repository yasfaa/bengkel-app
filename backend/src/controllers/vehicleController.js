const vehicleService = require('../services/vehicleService');
const asyncHandler = require('../utils/asyncHandler');

class VehicleController {
  // GET /api/vehicles/search?nopol=...
  searchVehicle = asyncHandler(async (req, res) => {
    const { nopol } = req.query;
    const vehicle = await vehicleService.searchVehicleByNopol(nopol);
    res.status(200).json(vehicle);
  });
}

module.exports = new VehicleController();
