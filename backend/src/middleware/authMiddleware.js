// controllers/auth-middleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Require JWT secret in production — fail fast to avoid insecure defaults
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}

/**
 * Authentication middleware
 * - Accepts: Authorization: Bearer <token> OR plain token in header OR cookie 'token' (if cookie-parser used)
 * - Verifies token, reloads user from DB, compares role/collegeId, attaches safe user to req
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 1) locate token: Authorization header (Bearer), plain header, or cookie
    const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '').toString();
    const cookieToken = req.cookies && req.cookies.token;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader) {
      // allow plain token in header
      token = authHeader.trim();
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided (Authorization header or cookie "token")',
      });
    }

    // 2) verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET || ''); // in dev could be fallback, but we failed earlier in prod
    } catch (verifyError) {
      // jwt library throws error types with name property
      if (verifyError && verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', message: 'Please login again' });
      }
      if (verifyError && verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', message: 'Token is malformed or invalid' });
      }
      return res.status(401).json({ error: 'Token verification failed', message: 'Invalid authentication token' });
    }

    // 3) validate minimal payload: try to find user id in sub or id
    const rawId = decoded && (decoded.sub ?? decoded.id ?? decoded.userId);
    const rawRole = decoded && (decoded.role ?? decoded.r);
    const rawCollegeId = decoded && (decoded.collegeId ?? decoded.c);

    const userId = Number(rawId);
    const tokenRole = typeof rawRole === 'string' ? rawRole.toUpperCase() : undefined;
    const tokenCollegeId = Number(rawCollegeId);

    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid token payload', message: 'Missing or invalid user id in token' });
    }
    if (!tokenRole) {
      return res.status(401).json({ error: 'Invalid token payload', message: 'Missing role in token' });
    }
    if (!tokenCollegeId || Number.isNaN(tokenCollegeId)) {
      return res.status(401).json({ error: 'Invalid token payload', message: 'Missing or invalid collegeId in token' });
    }

    // 4) (Optional) Token revocation check
    // If you track refresh tokens or token version on the user, check here.
    // Example (pseudo): if (await isTokenRevoked(userId, decoded.jti)) return 401
    // Placeholder:
    // const revoked = false; // implement your revocation logic here
    // if (revoked) return res.status(401).json({ error: 'Token revoked' });

    // 5) fetch fresh user from DB (exclude password)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found', message: 'User associated with token no longer exists' });
    }

    // 6) verify token claims match current user (prevent stale role/college issues)
    // Use strict equality on role & collegeId — if mismatch, require re-login
    if (user.role.toUpperCase() !== tokenRole || Number(user.collegeId) !== tokenCollegeId) {
      return res.status(401).json({
        error: 'Token invalidated',
        message: 'User role or college has changed. Please login again',
      });
    }

    // 7) attach safe user object
    req.user = user;
    // attach raw decoded token only if you need it; avoid attaching secrets
    req.auth = {
      sub: user.id,
      role: user.role,
      collegeId: user.collegeId,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: 'Authentication error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred during authentication',
    });
  }
};

/**
 * Role-based middleware
 * Usage: app.get('/admin', authMiddleware, roleMiddleware(['ADMIN']), handler)
 */
export const roleMiddleware = (roles = []) => {
  const allowedRoles = roles.map((r) => (typeof r === 'string' ? r.toUpperCase() : r));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated (run authMiddleware first)' });
    }
    const userRole = (req.user.role || '').toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        userRole,
        requiredRoles: allowedRoles,
      });
    }
    return next();
  };
};

/**
 * College-scope middleware
 * Ensures resource college matches user's college unless user is ADMIN
 * Usage: app.post('/colleges/:collegeId/...', authMiddleware, collegeScopeMiddleware, handler)
 */
export const collegeScopeMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
  }

  const candidate = req.body.collegeId ?? req.params.collegeId ?? req.query.collegeId;
  if (!candidate) return next();

  const resourceCollegeId = Number(candidate);
  if (Number.isNaN(resourceCollegeId)) {
    return res.status(400).json({ error: 'Invalid collegeId parameter' });
  }

  if (req.user.role !== 'ADMIN' && resourceCollegeId !== Number(req.user.collegeId)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. You can only access resources from your own college.',
    });
  }

  return next();
};
