const express = require('express');
const router = express.Router();
const prisma = require('../db');

const masterRoutes = require('./masterRoutes');
const mechanicRoutes = require('./mechanicRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const queueRoutes = require('./queueRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

// Health & Readiness Check Endpoint
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      message: 'Backend BengkelKu is healthy and connected to database.',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      message: 'Database connection error.',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount Sub-routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/services', queueRoutes);

module.exports = router;
