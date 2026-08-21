const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const serviceItemController = require('../controllers/serviceItemController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createServiceSchema,
  updateServiceStatusSchema,
} = require('../validations/serviceValidation');
const {
  addServiceItemSchema,
  updateServiceItemSchema,
} = require('../validations/serviceItemValidation');

// Global optional authentication across queue routes
router.use(authMiddleware.optional);

router
  .route('/')
  .get(queueController.getAllServices)
  .post(validate(createServiceSchema), queueController.createService);

router.patch(
  '/:id/status',
  validate(updateServiceStatusSchema),
  queueController.updateServiceStatus
);

// Work Order Items & Part Requisition (Stage 3)
router
  .route('/:id/items')
  .get(serviceItemController.getItemsByServiceId)
  .post(validate(addServiceItemSchema), serviceItemController.addServiceItem);

router
  .route('/:id/items/:itemId')
  .patch(validate(updateServiceItemSchema), serviceItemController.updateServiceItem)
  .delete(serviceItemController.removeServiceItem);

module.exports = router;
