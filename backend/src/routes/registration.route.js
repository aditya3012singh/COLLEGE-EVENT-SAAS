import express from 'express';
import {
  registerEventController,
  checkInEventController,
  razorpayWebhookController,
  getRegistrationsController,
  getMyRegistrationsController,
} from '../controllers/registration.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /registrations
 * Register for event (STUDENT only)
 */
router.post('/', authMiddleware, roleMiddleware(['STUDENT']), registerEventController);

/**
 * POST /registrations/checkin
 * Check-in to event (ORGANIZER/ADMIN only)
 */
router.post('/checkin', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), checkInEventController);

/**
 * POST /registrations/webhook/razorpay
 * Razorpay webhook for payment updates
 * Note: This should be mounted with express.raw() in server.js BEFORE express.json()
 */
router.post('/webhook/razorpay', razorpayWebhookController);

/**
 * GET /registrations/event/:eventId
 * Get all registrations for an event (ORGANIZER/ADMIN only)
 */
router.get('/event/:eventId', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), getRegistrationsController);

/**
 * GET /registrations/my
 * Get current user's registrations
 */
router.get('/my', authMiddleware, getMyRegistrationsController);

export default router;
