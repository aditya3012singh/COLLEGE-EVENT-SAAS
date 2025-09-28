// clubRoutes.js
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub
} from '../controllers/clubController.js';

const router = express.Router();

// Public: get all clubs
router.get('/', getAllClubs);

// Public: get club by ID
router.get('/:id', getClubById);

// Organizer/Admin only: CRUD
router.post('/', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createClub);
router.put('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), updateClub);
router.delete('/:id', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), deleteClub);

export default router;
