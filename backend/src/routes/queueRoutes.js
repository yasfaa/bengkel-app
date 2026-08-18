const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const validate = require('../middlewares/validate');
const {
  createServiceSchema,
  updateServiceStatusSchema,
} = require('../validations/serviceValidation');

router.route('/')
  .get(queueController.getAllServices)
  .post(validate(createServiceSchema), queueController.createService);

router.patch(
  '/:id/status',
  validate(updateServiceStatusSchema),
  queueController.updateServiceStatus
);

module.exports = router;
