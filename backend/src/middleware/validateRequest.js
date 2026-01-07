/**
 * Request Validation Middleware
 * Validates request body, query, and params using Zod schemas
 */

import { logger } from '../utils/logger.js';

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      logger.warn('Validation error', {
        path: req.path,
        method: req.method,
        errors: error.errors,
      });

      res.status(400).json({
        error: 'Validation failed',
        issues: error.format(),
      });
    }
  };
};

export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed;
      next();
    } catch (error) {
      logger.warn('Query validation error', {
        path: req.path,
        method: req.method,
        errors: error.errors,
      });

      res.status(400).json({
        error: 'Query validation failed',
        issues: error.format(),
      });
    }
  };
};

export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      req.params = parsed;
      next();
    } catch (error) {
      logger.warn('Params validation error', {
        path: req.path,
        method: req.method,
        errors: error.errors,
      });

      res.status(400).json({
        error: 'Params validation failed',
        issues: error.format(),
      });
    }
  };
};

export default { validateBody, validateQuery, validateParams };
