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

// Motor Brands Endpoints
router.route('/brands')
  .get(masterController.getAllBrands)
  .post(masterController.createBrand);

router.route('/brands/:id')
  .patch(masterController.updateBrand)
  .delete(masterController.deleteBrand);

// Motor Types Endpoints
router.route('/types')
  .get(masterController.getTypesByBrandId)
  .post(masterController.createType);

router.route('/types/:id')
  .patch(masterController.updateType)
  .delete(masterController.deleteType);

// Engine Capacities Endpoints
router.route('/capacities')
  .get(masterController.getAllCapacities)
  .post(masterController.createCapacity);

router.route('/capacities/:id')
  .patch(masterController.updateCapacity)
  .delete(masterController.deleteCapacity);

// Master Suppliers Endpoints
router.route('/suppliers')
  .get(masterController.getAllSuppliers)
  .post(masterController.createSupplier);

router.route('/suppliers/:id')
  .patch(masterController.updateSupplier)
  .delete(masterController.deleteSupplier);

// Spareparts Master Endpoints
router.route('/spareparts')
  .get(masterController.getAllSpareparts)
  .post(masterController.createSparepart);

router.route('/spareparts/:id')
  .get(masterController.getSparepartById)
  .patch(masterController.updateSparepart)
  .delete(masterController.deleteSparepart);

module.exports = router;
