import {
  registerService,
  loginService,
  getUserByIdService,
} from '../services/auth.service.js';

/**
 * Register a new user
 */
export const registerController = async (req, res) => {
  try {
    const { token, user } = await registerService(req.body);
    return res.status(201).json({ message: 'User registered', token, user });
  } catch (err) {
    console.error('Registration error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (err?.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid foreign key (collegeId?)' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user and return token
 */
export const loginController = async (req, res) => {
  try {
    const { token, user } = await loginService(req.body);
    return res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Login error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get current user profile
 */
export const getMeController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: req.user });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Verify token validity
 */
export const verifyTokenController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ valid: false });
    }
    return res.json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        collegeId: req.user.collegeId,
      },
    });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(500).json({ error: 'Token verification failed' });
  }
};
