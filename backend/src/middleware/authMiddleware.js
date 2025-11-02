import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

/**
 * Authentication Middleware
 * Validates JWT token and attaches user to request object
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No authorization header provided' 
      });
    }

    // Extract token (support both "Bearer <token>" and plain token)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7).trim() 
      : authHeader.trim();
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Token missing' 
      });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Please login again' 
        });
      }
      if (verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Token is malformed or invalid' 
        });
      }
      return res.status(401).json({ 
        error: 'Token verification failed',
        message: 'Invalid authentication token' 
      });
    }

    // Validate token payload
    if (!decoded.id || !decoded.role || !decoded.collegeId) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        message: 'Token is missing required information' 
      });
    }

    // Fetch user from database (without password)
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'User associated with token no longer exists' 
      });
    }

    // Verify token data matches current user data
    if (user.role !== decoded.role || user.collegeId !== decoded.collegeId) {
      return res.status(401).json({ 
        error: 'Token invalidated',
        message: 'User role or college has changed. Please login again' 
      });
    }

    // Attach user to request object (password already excluded in select)
    req.user = user;
    req.token = decoded; // Also attach decoded token for additional info if needed
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during authentication'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Must be used after authMiddleware
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['ADMIN', 'ORGANIZER'])
 */
export const roleMiddleware = (roles = []) => {
  const allowedRoles = roles.map(r => r.toUpperCase());
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated. Use authMiddleware first.' 
      });
    }

    const userRole = req.user.role.toUpperCase();
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        userRole: userRole,
        requiredRoles: allowedRoles
      });
    }
    
    next();
  };
};

/**
 * College-scoped Authorization Middleware
 * Ensures user can only access resources from their own college
 * Must be used after authMiddleware
 */
export const collegeScopeMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'User not authenticated' 
    });
  }

  // Extract collegeId from params or body
  const resourceCollegeId = req.body.collegeId || req.params.collegeId;
  
  if (resourceCollegeId && parseInt(resourceCollegeId) !== req.user.collegeId) {
    // Admin might have access to all colleges, but we'll enforce for others
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Access denied. You can only access resources from your own college.' 
      });
    }
  }

  next();
};
