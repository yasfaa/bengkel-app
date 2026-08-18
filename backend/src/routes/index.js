const express = require('express');
const router = express.Router();

const masterRoutes = require('./masterRoutes');
const mechanicRoutes = require('./mechanicRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const queueRoutes = require('./queueRoutes');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend BengkelKu is running.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Sub-routes
router.use('/master', masterRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/services', queueRoutes);

module.exports = router;
