const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
  })
);

// 2. CORS Configuration
app.use(cors());

// 3. Body Parsers with limits
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
