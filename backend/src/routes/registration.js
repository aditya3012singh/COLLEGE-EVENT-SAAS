// registrationRoutes.js
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import {
  registerForEvent,
  checkInEvent,
  getRegistrations
} from '../controllers/registrationController.js';

const router = express.Router();

// Student registers for an event (payment + QR)
router.post('/', authMiddleware, roleMiddleware(['STUDENT']), registerForEvent);

// Organizer scans QR to mark attendance
router.post('/checkin', authMiddleware, roleMiddleware(['ORGANIZER']), checkInEvent);

// Organizer views registrations
router.get('/event/:eventId', authMiddleware, roleMiddleware(['ORGANIZER']), getRegistrations);

export default router;
