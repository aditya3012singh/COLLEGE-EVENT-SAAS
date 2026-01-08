import express from 'express';
import {
  registerController,
  loginController,
  getMeController,
  verifyTokenController,
  logoutController,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', registerController);

/**
 * POST /auth/login
 * Login user and return token
 */
router.post('/login', loginController);

/**
 * POST /auth/logout
 * Logout user by clearing cookie
 */
router.post('/logout', logoutController);

/**
 * GET /auth/me
 * Get current user profile (requires auth)
 */
router.get('/me', authMiddleware, getMeController);

/**
 * GET /auth/verify
 * Verify token validity (requires auth)
 */
router.get('/verify', authMiddleware, verifyTokenController);

export default router;
