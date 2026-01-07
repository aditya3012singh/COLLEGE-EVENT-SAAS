/**
 * Request Logging Middleware
 * Logs all incoming requests with method, path, duration, and status
 */

import { logger } from '../utils/logger.js';

export const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Attach request ID for tracking
  req.id = Math.random().toString(36).substring(2);

  // Log request
  logger.info(`Incoming ${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Hook response finish to log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} ${statusCode}`, logData);
    } else {
      logger.info(`${req.method} ${req.path} ${statusCode}`, logData);
    }
  });

  next();
};

export default requestLoggingMiddleware;
