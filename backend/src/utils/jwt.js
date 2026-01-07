/**
 * JWT Utility
 * Centralized JWT token generation and verification
 */

import jwt from 'jsonwebtoken';
import { getEnv } from './env.js';

const JWT_SECRET = getEnv('JWT_SECRET');
const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '1h');

/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        status: 401,
        message: 'Token expired',
      };
    }
    if (error.name === 'JsonWebTokenError') {
      throw {
        status: 401,
        message: 'Invalid token',
      };
    }
    throw {
      status: 401,
      message: 'Token verification failed',
    };
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default { generateAccessToken, verifyAccessToken, decodeToken };
