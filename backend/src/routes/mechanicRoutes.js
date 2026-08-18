const express = require('express');
const router = express.Router();
const mechanicController = require('../controllers/mechanicController');

router.route('/')
  .get(mechanicController.getAllMechanics)
  .post(mechanicController.createMechanic);

router.route('/:id')
  .get(mechanicController.getMechanicById)
  .patch(mechanicController.updateMechanic)
  .delete(mechanicController.deleteMechanic);

module.exports = router;
