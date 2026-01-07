import { bootstrapService } from '../services/bootstrap.service.js';

/**
 * Bootstrap - create initial admin and college
 */
export const bootstrapController = async (req, res) => {
  try {
    const { college, admin } = await bootstrapService(req.body);
    return res.status(201).json({
      message: 'Bootstrap completed successfully. Admin and college created.',
      college,
      admin: {
        ...admin,
        password: '***hidden***',
      },
      note: 'Please login with the admin credentials to access the system.',
    });
  } catch (err) {
    console.error('Bootstrap error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'College code or email already exists' });
    }
    return res.status(500).json({
      error: 'Bootstrap failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};
