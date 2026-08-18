const AppError = require('../utils/appError');

/**
 * Middleware factory for Zod Schema Validation
 * Validates request body, query, and params against Zod schemas
 * @param {object|import('zod').ZodSchema} schemaOrSchemas Zod schema for body or object with { body, query, params }
 */
const validate = (schemaOrSchemas) => {
  return (req, res, next) => {
    const schemas =
      schemaOrSchemas && (schemaOrSchemas.body || schemaOrSchemas.query || schemaOrSchemas.params)
        ? schemaOrSchemas
        : { body: schemaOrSchemas };

    const errorDetails = {};

    ['body', 'query', 'params'].forEach((sourceKey) => {
      if (schemas[sourceKey]) {
        const result = schemas[sourceKey].safeParse(req[sourceKey]);
        if (!result.success) {
          const issues = result.error.issues || [];
          issues.forEach((issue) => {
            const field = issue.path.join('.') || sourceKey;
            errorDetails[field] = issue.message;
          });
        } else {
          req[sourceKey] = result.data;
        }
      }
    });

    if (Object.keys(errorDetails).length > 0) {
      const firstErrorMessage = Object.values(errorDetails)[0];
      const error = new AppError(firstErrorMessage || 'Data input tidak valid.', 400);
      error.details = errorDetails;
      return next(error);
    }

    next();
  };
};

module.exports = validate;
