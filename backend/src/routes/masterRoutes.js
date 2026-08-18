const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');

// Services Catalog Endpoints
router.route('/services')
  .get(masterController.getAllServices)
  .post(masterController.createService);

router.route('/services/:id')
  .get(masterController.getServiceById)
  .patch(masterController.updateService)
  .delete(masterController.deleteService);

// Motor Brands, Types, Capacities Endpoints
router.get('/brands', masterController.getAllBrands);
router.get('/types', masterController.getTypesByBrandId);
router.get('/capacities', masterController.getAllCapacities);

module.exports = router;
