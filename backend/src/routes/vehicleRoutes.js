const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/search', vehicleController.searchVehicle);

module.exports = router;
