const serviceItemService = require('../services/serviceItemService');
const asyncHandler = require('../utils/asyncHandler');

class ServiceItemController {
  // GET /api/services/:id/items
  getItemsByServiceId = asyncHandler(async (req, res) => {
    const items = await serviceItemService.getItemsByServiceId(req.params.id);
    res.status(200).json(items);
  });

  // POST /api/services/:id/items
  addServiceItem = asyncHandler(async (req, res) => {
    const created = await serviceItemService.addServiceItem(req.params.id, req.body, req.user);
    res.status(201).json(created);
  });

  // PATCH /api/services/:id/items/:itemId
  updateServiceItem = asyncHandler(async (req, res) => {
    const updated = await serviceItemService.updateServiceItem(
      req.params.id,
      req.params.itemId,
      req.body,
      req.user
    );
    res.status(200).json(updated);
  });

  // DELETE /api/services/:id/items/:itemId
  removeServiceItem = asyncHandler(async (req, res) => {
    const result = await serviceItemService.removeServiceItem(
      req.params.id,
      req.params.itemId,
      req.user
    );
    res.status(200).json(result);
  });
}

module.exports = new ServiceItemController();
