// routes.js
import express from 'express';
import { register, login, getMe, verifyToken } from './controllers/authController.js';
import { bootstrap } from './controllers/bootstrapController.js';
import {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from './controllers/collegeController.js'; // fixed filename casing
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getMyMemberships,
  joinClub,
  getMyClubs,
  getClubMembershipRequests,
  updateMembershipStatus,
} from './controllers/clubController.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
  getMyEvents,
} from './controllers/eventController.js';
import {
  registerForEvent,
  checkInEvent,
  getRegistrations,
  getMyRegistrations,
  razorpayWebhook,
} from './controllers/registrationController.js';
import { authMiddleware, roleMiddleware } from './middleware/authMiddleware.js';

const router = express.Router();

// ===== Bootstrap Route (Must be before auth routes) =====
// Creates first admin and college - only works if no colleges exist
router.post('/bootstrap', bootstrap);

// ===== Auth Routes =====
router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/auth/me', authMiddleware, getMe);
router.get('/auth/verify', authMiddleware, verifyToken);

// ===== College Routes =====
router.get('/colleges', getAllColleges);
router.get('/colleges/:id', getCollegeById);

router.post('/colleges', authMiddleware, roleMiddleware(['ADMIN']), createCollege);
router.put('/colleges/:id', authMiddleware, roleMiddleware(['ADMIN']), updateCollege);
router.delete('/colleges/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCollege);

// ===== Club Routes =====
router.get('/clubs', getAllClubs);
router.get('/clubs/:id', getClubById);

router.post('/clubs', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createClub);
router.put('/clubs/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateClub);
router.delete('/clubs/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteClub);

// ===== Club Membership Routes =====
router.get('/clubs/my-memberships', authMiddleware, getMyMemberships); // Get student's clubs
router.post('/clubs/:id/join', authMiddleware, roleMiddleware(['STUDENT']), joinClub); // Join a club
router.get('/clubs/my', authMiddleware, getMyClubs); // Get organizer's created clubs
router.get('/clubs/membership-requests', authMiddleware, getClubMembershipRequests); // Get pending membership requests
router.put('/clubs/memberships/:id', authMiddleware, updateMembershipStatus); // Approve/reject membership

// ===== Event Routes =====
router.post('/events', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createEvent);
router.put('/events/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateEvent);
router.delete('/events/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteEvent);

router.get('/events', authMiddleware, getEvents);
router.get('/events/my', authMiddleware, getMyEvents); // Get organizer's created events
router.get('/events/:id', authMiddleware, getEventById);

// ===== Registration Routes (webhook uses raw body; see server setup) =====
// Student event registration
router.post('/registrations', authMiddleware, roleMiddleware(['STUDENT']), registerForEvent);

// Student views their own registrations
router.get('/registrations/my', authMiddleware, getMyRegistrations);

// Organizer marks attendance via QR
router.post('/registrations/checkin', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), checkInEvent);

// Organizer views registrations for an event
router.get('/registrations/event/:eventId', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), getRegistrations);

export default router;
