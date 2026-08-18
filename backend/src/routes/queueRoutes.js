const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.route('/')
  .get(queueController.getAllServices)
  .post(queueController.createService);

router.patch('/:id/status', queueController.updateServiceStatus);

module.exports = router;
