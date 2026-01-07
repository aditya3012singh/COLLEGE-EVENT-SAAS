import express from 'express';
import {
  registerEventController,
  checkInEventController,
  razorpayWebhookController,
  getRegistrationDetailsController,
  cancelRegistrationController,
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
 * GET /registrations/:id
 * Get registration details
 */
router.get('/:id', authMiddleware, getRegistrationDetailsController);

/**
 * PUT /registrations/:id/cancel
 * Cancel registration
 */
router.put('/:id/cancel', authMiddleware, cancelRegistrationController);

export default router;
