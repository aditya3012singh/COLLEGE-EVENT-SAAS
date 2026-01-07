/**
 * Error Handler Utility
 * Standardizes error formatting and handles Prisma-specific errors
 */

import { logger } from './logger.js';

const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: 'Unique constraint violated' },
  P2003: { status: 400, message: 'Invalid foreign key reference' },
  P2004: { status: 400, message: 'Constraint failed' },
  P2005: { status: 400, message: 'Invalid value provided' },
  P2006: { status: 400, message: 'Relation type mismatch' },
  P2007: { status: 400, message: 'Data validation error' },
  P2008: { status: 400, message: 'Query parsing failed' },
  P2009: { status: 400, message: 'Query validation failed' },
  P2010: { status: 400, message: 'Raw query failed' },
  P2011: { status: 400, message: 'Null constraint violation' },
  P2012: { status: 400, message: 'Missing required field' },
  P2013: { status: 400, message: 'Missing argument' },
  P2014: { status: 409, message: 'Required relation violation' },
  P2015: { status: 404, message: 'Related record not found' },
  P2016: { status: 400, message: 'Query interpretation error' },
  P2017: { status: 400, message: 'Relation violation' },
  P2018: { status: 400, message: 'Required argument missing' },
  P2019: { status: 400, message: 'Input error' },
  P2020: { status: 400, message: 'Value too long' },
  P2021: { status: 404, message: 'Table not found' },
  P2022: { status: 404, message: 'Column not found' },
  P2023: { status: 400, message: 'Inconsistent column data' },
  P2024: { status: 503, message: 'Database connection lost' },
  P2025: { status: 404, message: 'Required record not found' },
};

/**
 * Format and standardize error response
 */
export const formatError = (error, isDev = false) => {
  // Already formatted error
  if (error?.status && error?.message) {
    return error;
  }

  // Prisma errors
  if (error?.code && PRISMA_ERROR_MAP[error.code]) {
    const { status, message } = PRISMA_ERROR_MAP[error.code];
    return {
      status,
      message,
      ...(isDev && { prismaCode: error.code, prismaMessage: error.message }),
    };
  }

  // Validation errors
  if (error?.name === 'ZodError') {
    return {
      status: 400,
      message: 'Validation failed',
      issues: error.format(),
    };
  }

  // JWT errors
  if (error?.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Token expired',
    };
  }

  if (error?.name === 'JsonWebTokenError') {
    return {
      status: 401,
      message: 'Invalid token',
    };
  }

  // Generic error
  return {
    status: error?.status || 500,
    message: error?.message || 'Internal server error',
    ...(isDev && { originalError: error?.message }),
  };
};

/**
 * Handle errors in controllers and log them
 */
export const handleError = (err, functionName = 'Unknown') => {
  const isDev = process.env.NODE_ENV !== 'production';
  const formattedError = formatError(err, isDev);

  logger.error(`Error in ${functionName}`, {
    status: formattedError.status,
    message: formattedError.message,
    originalError: isDev ? err : undefined,
  });

  return formattedError;
};

/**
 * Middleware for global error handling
 */
export const globalErrorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const formattedError = formatError(err, isDev);

  logger.error('Unhandled error', {
    path: req.path,
    method: req.method,
    status: formattedError.status,
    message: formattedError.message,
    originalError: isDev ? err : undefined,
  });

  res.status(formattedError.status).json({
    error: formattedError.message,
    ...(formattedError.issues && { issues: formattedError.issues }),
    ...(isDev && formattedError.originalError && { details: formattedError.originalError }),
  });
};

export default { formatError, handleError, globalErrorHandler };
