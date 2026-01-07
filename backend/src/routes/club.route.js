import express from 'express';
import {
  getAllClubsController,
  getClubByIdController,
  createClubController,
  updateClubController,
  deleteClubController,
  getMyClubsController,
  getClubMembershipRequestsController,
  updateMembershipStatusController,
  getMyMembershipsController,
  joinClubController,
} from '../controllers/club.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /clubs/my/list
 * Get user's created clubs (ORGANIZER/ADMIN only)
 */
router.get('/my/list', authMiddleware, getMyClubsController);

/**
 * GET /clubs/my/memberships
 * Get user's club memberships
 */
router.get('/my/memberships', authMiddleware, getMyMembershipsController);

/**
 * GET /clubs/membership-requests
 * Get pending membership requests for user's clubs (ORGANIZER/ADMIN only)
 */
router.get('/membership-requests', authMiddleware, getClubMembershipRequestsController);

/**
 * PUT /clubs/memberships/:id
 * Approve/reject membership request
 */
router.put('/memberships/:id', authMiddleware, updateMembershipStatusController);

/**
 * GET /clubs
 * Get all clubs (public)
 */
router.get('/', getAllClubsController);

/**
 * POST /clubs
 * Create a new club (ORGANIZER/ADMIN only)
 */
router.post('/', authMiddleware, roleMiddleware(['ORGANIZER', 'ADMIN']), createClubController);

/**
 * GET /clubs/:id
 * Get club by ID
 */
router.get('/:id', getClubByIdController);

/**
 * POST /clubs/:id/join
 * Join a club
 */
router.post('/:id/join', authMiddleware, joinClubController);

/**
 * PUT /clubs/:id
 * Update club (creator/admin only)
 */
router.put('/:id', authMiddleware, updateClubController);

/**
 * DELETE /clubs/:id
 * Delete club (creator/admin only, soft delete)
 */
router.delete('/:id', authMiddleware, deleteClubController);

export default router;
