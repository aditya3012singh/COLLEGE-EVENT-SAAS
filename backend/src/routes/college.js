// collegeRoutes.js
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege
} from '../controllers/collegeCOntroller.js';

const router = express.Router();

// Public: get all colleges
router.get('/', getAllColleges);

// Public: get college by ID
router.get('/:id', getCollegeById);

// Admin only: create, update, delete colleges
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), createCollege);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), updateCollege);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCollege);

export default router;
