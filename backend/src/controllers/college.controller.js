import {
  getAllCollegesService,
  getCollegeByIdService,
  createCollegeService,
  updateCollegeService,
  deleteCollegeService,
} from '../services/college.service.js';

/**
 * Get all colleges
 */
export const getAllCollegesController = async (req, res) => {
  try {
    const result = await getAllCollegesService(req.query);
    return res.status(200).json({
      message: 'Colleges retrieved successfully',
      ...result,
    });
  } catch (err) {
    console.error('Get all colleges error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({
      error: 'Failed to fetch colleges',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * Get college by ID
 */
export const getCollegeByIdController = async (req, res) => {
  try {
    const college = await getCollegeByIdService(req.params.id);
    return res.status(200).json({ message: 'College fetched successfully', college });
  } catch (err) {
    console.error('Get college by ID error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({
      error: 'Failed to fetch college details',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * Create college
 */
export const createCollegeController = async (req, res) => {
  try {
    const college = await createCollegeService(req.body, req.user.role);
    return res.status(201).json({ message: 'College created successfully', college });
  } catch (err) {
    console.error('Create college error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'College code must be unique' });
    }
    return res.status(500).json({
      error: 'Failed to create college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * Update college
 */
export const updateCollegeController = async (req, res) => {
  try {
    const college = await updateCollegeService(req.params.id, req.body, req.user.role);
    return res.status(200).json({ message: 'College updated successfully', college });
  } catch (err) {
    console.error('Update college error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({
      error: 'Failed to update college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * Delete college
 */
export const deleteCollegeController = async (req, res) => {
  try {
    await deleteCollegeService(req.params.id, req.user.role);
    return res.status(200).json({ message: 'College deleted successfully' });
  } catch (err) {
    console.error('Delete college error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({
      error: 'Failed to delete college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};
