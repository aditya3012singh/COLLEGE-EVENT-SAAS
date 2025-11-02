import express from 'express';
import { register, login, getMe, verifyToken } from './controllers/authController.js';
import {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from './controllers/collegeCOntroller.js';
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
} from './controllers/clubController.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
} from './controllers/eventController.js';
import {
  registerForEvent,
  checkInEvent,
  getRegistrations,
  razorpayWebhook,
} from './controllers/registrationController.js';
import { authMiddleware, roleMiddleware } from './middleware/authMiddleware.js';
import expressRaw from 'express';

// Create main router
const router = express.Router();

// ===== Auth Routes =====
// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected routes
router.get('/auth/me', authMiddleware, getMe);
router.get('/auth/verify', authMiddleware, verifyToken);

// ===== College Routes =====
// Public
router.get('/colleges', getAllColleges);
router.get('/colleges/:id', getCollegeById);

// Admin only
router.post('/colleges', authMiddleware, roleMiddleware(['ADMIN']), createCollege);
router.put('/colleges/:id', authMiddleware, roleMiddleware(['ADMIN']), updateCollege);
router.delete('/colleges/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCollege);

// ===== Club Routes =====
// Public
router.get('/clubs', getAllClubs);
router.get('/clubs/:id', getClubById);

// Organizer/Admin only
router.post('/clubs', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createClub);
router.put('/clubs/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateClub);
router.delete('/clubs/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteClub);

// ===== Event Routes =====
// Organizer/Admin only for modifications
router.post('/events', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createEvent);
router.put('/events/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateEvent);
router.delete('/events/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteEvent);

// Authenticated users can fetch events
router.get('/events', authMiddleware, getEvents);
router.get('/events/:id', authMiddleware, getEventById);

// ===== Registration Routes =====
// Razorpay webhook (raw body parsing required)
router.post(
  '/registrations/webhook/razorpay',
  expressRaw.raw({ type: 'application/json' }),
  razorpayWebhook
);

// Student event registration
router.post('/registrations', authMiddleware, roleMiddleware(['STUDENT']), registerForEvent);

// Organizer marks attendance via QR
router.post('/registrations/checkin', authMiddleware, roleMiddleware(['ORGANIZER']), checkInEvent);

// Organizer views registrations for an event
router.get('/registrations/event/:eventId', authMiddleware, roleMiddleware(['ORGANIZER']), getRegistrations);

export default router;
