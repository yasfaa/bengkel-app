const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const validate = require('../middlewares/validate');
const {
  createServiceMasterSchema,
  updateServiceMasterSchema,
  createSparepartSchema,
  updateSparepartSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createBrandSchema,
  updateBrandSchema,
  createTypeSchema,
  updateTypeSchema,
  createCapacitySchema,
  updateCapacitySchema,
} = require('../validations/masterValidation');

// Services Catalog Endpoints
router
  .route('/services')
  .get(masterController.getAllServices)
  .post(validate(createServiceMasterSchema), masterController.createService);

router
  .route('/services/:id')
  .get(masterController.getServiceById)
  .patch(validate(updateServiceMasterSchema), masterController.updateService)
  .delete(masterController.deleteService);

// Motor Brands Endpoints
router
  .route('/brands')
  .get(masterController.getAllBrands)
  .post(validate(createBrandSchema), masterController.createBrand);

router
  .route('/brands/:id')
  .patch(validate(updateBrandSchema), masterController.updateBrand)
  .delete(masterController.deleteBrand);

// Motor Types Endpoints
router
  .route('/types')
  .get(masterController.getTypesByBrandId)
  .post(validate(createTypeSchema), masterController.createType);

router
  .route('/types/:id')
  .patch(validate(updateTypeSchema), masterController.updateType)
  .delete(masterController.deleteType);

// Engine Capacities Endpoints
router
  .route('/capacities')
  .get(masterController.getAllCapacities)
  .post(validate(createCapacitySchema), masterController.createCapacity);

router
  .route('/capacities/:id')
  .patch(validate(updateCapacitySchema), masterController.updateCapacity)
  .delete(masterController.deleteCapacity);

// Master Suppliers Endpoints
router
  .route('/suppliers')
  .get(masterController.getAllSuppliers)
  .post(validate(createSupplierSchema), masterController.createSupplier);

router
  .route('/suppliers/:id')
  .patch(validate(updateSupplierSchema), masterController.updateSupplier)
  .delete(masterController.deleteSupplier);

// Spareparts Master Endpoints
router
  .route('/spareparts')
  .get(masterController.getAllSpareparts)
  .post(validate(createSparepartSchema), masterController.createSparepart);

router
  .route('/spareparts/:id')
  .get(masterController.getSparepartById)
  .patch(validate(updateSparepartSchema), masterController.updateSparepart)
  .delete(masterController.deleteSparepart);

module.exports = router;
