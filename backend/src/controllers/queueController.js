const queueService = require('../services/queueService');
const asyncHandler = require('../utils/asyncHandler');

class QueueController {
  // GET /api/services
  getAllServices = asyncHandler(async (req, res) => {
    const services = await queueService.getAllServices();
    res.status(200).json(services);
  });

  // POST /api/services
  createService = asyncHandler(async (req, res) => {
    const service = await queueService.createService(req.body);
    res.status(201).json(service);
  });

  // PATCH /api/services/:id/status
  updateServiceStatus = asyncHandler(async (req, res) => {
    const updated = await queueService.updateServiceStatus(req.params.id, req.body);
    res.status(200).json(updated);
  });
}

module.exports = new QueueController();
