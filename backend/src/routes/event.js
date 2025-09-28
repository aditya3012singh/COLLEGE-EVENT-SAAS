// eventRoutes.js
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById
} from '../controllers/eventController.js';

const router = express.Router();

// Organizer/Admin only: create, update, delete events
router.post('/', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createEvent);
router.put('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteEvent);

// Students/Organizers: fetch events
router.get('/', authMiddleware, getEvents);
router.get('/:id', authMiddleware, getEventById);

export default router;
