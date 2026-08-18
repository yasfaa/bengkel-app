const masterService = require('../services/masterService');
const asyncHandler = require('../utils/asyncHandler');

class MasterController {
  // GET /api/master/services
  getAllServices = asyncHandler(async (req, res) => {
    const services = await masterService.getAllServices();
    res.status(200).json(services);
  });

  // GET /api/master/services/:id
  getServiceById = asyncHandler(async (req, res) => {
    const service = await masterService.getServiceById(req.params.id);
    res.status(200).json(service);
  });

  // POST /api/master/services
  createService = asyncHandler(async (req, res) => {
    const created = await masterService.createService(req.body);
    res.status(201).json(created);
  });

  // PATCH /api/master/services/:id
  updateService = asyncHandler(async (req, res) => {
    const updated = await masterService.updateService(req.params.id, req.body);
    res.status(200).json(updated);
  });

  // DELETE /api/master/services/:id
  deleteService = asyncHandler(async (req, res) => {
    await masterService.deleteService(req.params.id);
    res.status(204).send();
  });

  // GET /api/master/brands
  getAllBrands = asyncHandler(async (req, res) => {
    const brands = await masterService.getAllBrands();
    res.status(200).json(brands);
  });

  // GET /api/master/types?brandId=...
  getTypesByBrandId = asyncHandler(async (req, res) => {
    const types = await masterService.getTypesByBrandId(req.query.brandId);
    res.status(200).json(types);
  });

  // GET /api/master/capacities
  getAllCapacities = asyncHandler(async (req, res) => {
    const capacities = await masterService.getAllCapacities();
    res.status(200).json(capacities);
  });
}

module.exports = new MasterController();
