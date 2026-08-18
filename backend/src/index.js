require('dotenv').config();
const app = require('./app');
const prisma = require('./db');

const PORT = process.env.PORT || 3000;

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`===========================================`);
  console.log(` BengkelKu Backend API Server              `);
  console.log(` Running on: http://localhost:${PORT}      `);
  console.log(` Swagger Docs: http://localhost:${PORT}/api-docs `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===========================================`);
});

// Graceful Shutdown Handler
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('[Database] Prisma disconnected cleanly.');
    } catch (err) {
      console.error('[Database] Error disconnecting Prisma:', err);
    }
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception thrown:', error);
  process.exit(1);
});
