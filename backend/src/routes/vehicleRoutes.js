const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const validate = require('../middlewares/validate');
const { searchVehicleQuerySchema } = require('../validations/vehicleValidation');

router.get(
  '/search',
  validate({ query: searchVehicleQuerySchema }),
  vehicleController.searchVehicle
);

module.exports = router;
