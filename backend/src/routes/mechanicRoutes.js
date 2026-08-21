const express = require('express');
const router = express.Router();
const mechanicController = require('../controllers/mechanicController');
const validate = require('../middlewares/validate');
const { createMechanicSchema, updateMechanicSchema } = require('../validations/mechanicValidation');

router
  .route('/')
  .get(mechanicController.getAllMechanics)
  .post(validate(createMechanicSchema), mechanicController.createMechanic);

router
  .route('/:id')
  .get(mechanicController.getMechanicById)
  .patch(validate(updateMechanicSchema), mechanicController.updateMechanic)
  .delete(mechanicController.deleteMechanic);

module.exports = router;
