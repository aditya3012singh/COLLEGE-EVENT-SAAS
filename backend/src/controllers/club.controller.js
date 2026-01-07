import {
  getAllClubsService,
  getClubByIdService,
  createClubService,
  updateClubService,
  deleteClubService,
  getMyClubsService,
  getClubMembershipRequestsService,
  updateMembershipStatusService,
  getMyMembershipsService,
  joinClubService,
} from '../services/club.service.js';

/**
 * Get all clubs
 */
export const getAllClubsController = async (req, res) => {
  try {
    const result = await getAllClubsService(req.query);
    return res.json({
      message: 'Clubs fetched successfully',
      data: result.clubs,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('getAllClubs Error:', err);
    return res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

/**
 * Get club by ID
 */
export const getClubByIdController = async (req, res) => {
  try {
    const club = await getClubByIdService(req.params.id);
    return res.json({
      message: 'Club fetched successfully',
      data: club,
    });
  } catch (err) {
    console.error('getClubById Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch club details' });
  }
};

/**
 * Create club
 */
export const createClubController = async (req, res) => {
  try {
    const club = await createClubService(req.body, req.user.id, req.user.role);
    return res.status(201).json({
      message: 'Club created successfully',
      data: club,
    });
  } catch (err) {
    console.error('createClub Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to create club' });
  }
};

/**
 * Update club
 */
export const updateClubController = async (req, res) => {
  try {
    const club = await updateClubService(req.params.id, req.body, req.user.id, req.user.role);
    return res.json({
      message: 'Club updated successfully',
      data: club,
    });
  } catch (err) {
    console.error('updateClub Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to update club' });
  }
};

/**
 * Delete club
 */
export const deleteClubController = async (req, res) => {
  try {
    await deleteClubService(req.params.id, req.user.id, req.user.role);
    return res.json({ message: 'Club deleted successfully' });
  } catch (err) {
    console.error('deleteClub Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to delete club' });
  }
};

/**
 * Get user's created clubs
 */
export const getMyClubsController = async (req, res) => {
  try {
    const clubs = await getMyClubsService(req.user.id);
    return res.json({
      message: 'Clubs fetched successfully',
      data: clubs,
    });
  } catch (err) {
    console.error('getMyClubs Error:', err);
    return res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

/**
 * Get pending membership requests for user's clubs
 */
export const getClubMembershipRequestsController = async (req, res) => {
  try {
    const requests = await getClubMembershipRequestsService(req.user.id);
    return res.json({
      message: 'Membership requests fetched successfully',
      data: requests,
      count: requests.length,
    });
  } catch (err) {
    console.error('getClubMembershipRequests Error:', err);
    return res.status(500).json({ error: 'Failed to fetch membership requests' });
  }
};

/**
 * Approve/reject membership request
 */
export const updateMembershipStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const membership = await updateMembershipStatusService(req.params.id, status, req.user.id, req.user.role);
    return res.json({
      message: `Membership ${status.toLowerCase()} successfully`,
      data: membership,
    });
  } catch (err) {
    console.error('updateMembershipStatus Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to update membership status' });
  }
};

/**
 * Get user's club memberships
 */
export const getMyMembershipsController = async (req, res) => {
  try {
    const memberships = await getMyMembershipsService(req.user.id);
    return res.json({
      message: 'Memberships fetched successfully',
      data: memberships,
    });
  } catch (err) {
    console.error('getMyMemberships Error:', err);
    return res.status(500).json({ error: 'Failed to fetch memberships' });
  }
};

/**
 * Join a club
 */
export const joinClubController = async (req, res) => {
  try {
    const membership = await joinClubService(req.params.id, req.user.id, req.user.collegeId);
    return res.status(201).json({
      message: 'Membership request sent successfully',
      data: membership,
    });
  } catch (err) {
    console.error('joinClub Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, membership: err.membership });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Membership already exists' });
    }
    return res.status(500).json({ error: 'Failed to join club' });
  }
};
