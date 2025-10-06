import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
const { PrismaClient, UserRole } = pkg;

const prisma = new PrismaClient();

// now you can use PrismaClient and UserRole as before


export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user, filtering sensitive info if needed
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error', details: err.message });
  }
};

export const roleMiddleware = (roles = []) => {
  // convert string roles to uppercase and compare to Prisma enum roles (optional)
  const allowedRoles = roles.map(r => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user info' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }
    next();
  };
};
