/**
 * Validation Middleware Helper
 * Reusable validation middleware for Zod schemas
 */

export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = req[source];
      const parsed = await schema.parseAsync(data);
      req[source] = parsed;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        issues: error.format(),
      });
    }
  };
};

/**
 * Parse and validate data
 */
export const parseAndValidate = (schema, data) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw {
      status: 400,
      message: 'Validation failed',
      issues: result.error.format(),
    };
  }

  return result.data;
};

export default { validateRequest, parseAndValidate };
