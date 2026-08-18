const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const apiRoutes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const notFoundHandler = require('./middlewares/notFoundMiddleware');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1. Security Headers (contentSecurityPolicy disabled to allow Swagger UI rendering)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS Configuration (Supports whitelisting via CORS_ORIGIN env)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// 3. Global API Rate Limiting (DDoS & Brute-force defense)
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    error: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat.',
    message: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat.',
  },
});

app.use('/api', apiRateLimiter);

// 4. Body Parsers with limits (DoS payload size defense)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Request Logging
app.use(requestLogger);

// 5. Swagger API Documentation (UI & Raw JSON endpoints)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BengkelKu API Docs',
}));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BengkelKu API Docs',
}));

// 6. API Routes
app.use('/api', apiRoutes);

// 7. 404 Handler for undefined routes
app.use(notFoundHandler);

// 8. Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
