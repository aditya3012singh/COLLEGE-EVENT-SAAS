import express from 'express';
import {
  createEventController,
  updateEventController,
  deleteEventController,
  getAllEventsController,
  getEventByIdController,
  getMyEventsController,
} from '../controllers/event.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /events
 * Create event (ORGANIZER/ADMIN only)
 */
router.post('/', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createEventController);

/**
 * PUT /events/:id
 * Update event (creator/admin only)
 */
router.put('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateEventController);

/**
 * DELETE /events/:id
 * Delete event (creator/admin only)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteEventController);

/**
 * GET /events
 * Get events for user's college (requires auth)
 */
router.get('/', authMiddleware, getAllEventsController);

/**
 * GET /events/:id
 * Get event details by ID
 */
router.get('/:id', authMiddleware, getEventByIdController);

/**
 * GET /events/my
 * Get events created by current user
 */
router.get('/my', authMiddleware, getMyEventsController);

export default router;
