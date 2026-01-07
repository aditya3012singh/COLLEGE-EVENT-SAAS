import express from 'express';
import {
  getAllCollegesController,
  getCollegeByIdController,
  createCollegeController,
  updateCollegeController,
  deleteCollegeController,
} from '../controllers/college.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /colleges
 * Get all colleges (public)
 */
router.get('/', getAllCollegesController);

/**
 * GET /colleges/:id
 * Get college by ID with associated clubs and events
 */
router.get('/:id', getCollegeByIdController);

/**
 * POST /colleges
 * Create a new college (ADMIN only)
 */
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), createCollegeController);

/**
 * PUT /colleges/:id
 * Update college (ADMIN only)
 */
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), updateCollegeController);

/**
 * DELETE /colleges/:id
 * Delete college (ADMIN only)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCollegeController);

export default router;
