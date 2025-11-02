import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using default secret (NOT SECURE FOR PRODUCTION)');
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12; // Increased for better security

/**
 * User Registration
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !collegeId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'role', 'collegeId']
      });
    }

    // Validate role
    const validRoles = ['STUDENT', 'ORGANIZER', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles
      });
    }

    // Check if college exists
    const college = await prisma.college.findUnique({ 
      where: { id: collegeId },
      select: { id: true, name: true, code: true }
    });
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered',
        message: 'A user with this email already exists'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { 
        name: name.trim(),
        email: email.toLowerCase().trim(), 
        password: hashedPassword, 
        role: role.toUpperCase(),
        collegeId 
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        collegeId: user.collegeId,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    // Handle Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }
    
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Invalid college ID' 
      });
    }

    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during registration'
    });
  }
};

/**
 * User Login
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user with college info
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true
          }
        }
      }
    });

    if (!user) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        collegeId: user.collegeId,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during login'
    });
  }
};

/**
 * Get Current User Profile
 * GET /auth/me
 */
export const getMe = async (req, res) => {
  try {
    // User is attached by authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};

/**
 * Verify Token
 * GET /auth/verify
 */
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, token is valid (authMiddleware already verified it)
    res.json({ 
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        collegeId: req.user.collegeId
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ 
      error: 'Token verification failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};
