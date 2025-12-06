// controllers/auth.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ---------- Config (require JWT_SECRET in production) ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in production');
    process.exit(1);
  } else {
    console.warn('⚠️ JWT_SECRET not set - using fallback for local/dev only');
  }
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // recommended: short-lived access token
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

/* ---------- Zod Schemas ---------- */
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'ORGANIZER', 'ADMIN']),
  collegeId: z.union([z.string(), z.number()]).transform((v) => Number(v)),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* ---------- Helpers ---------- */
function makeAccessToken(payload) {
  if (!JWT_SECRET) return null;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/* ---------- Register ---------- */
export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });
    }
    const { name, email, password, role, collegeId } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true, code: true },
    });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        collegeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        createdAt: true,
        updatedAt: true,
        college: { select: { id: true, name: true, code: true, logo: true } },
      },
    });

    const token = makeAccessToken({
      sub: user.id,
      role: user.role,
      collegeId: user.collegeId,
      email: user.email,
    });

    return res.status(201).json({ message: 'User registered', token, user });
  } catch (err) {
    console.error('Registration error:', err);
    // Prisma unique constraint
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Email already registered' });
    if (err?.code === 'P2003') return res.status(400).json({ error: 'Invalid foreign key (collegeId?)' });
    return res.status(500).json({ error: 'Registration failed' });
  }
};

/* ---------- Login ---------- */
export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        collegeId: true,
        createdAt: true,
        updatedAt: true,
        college: { select: { id: true, name: true, code: true, logo: true } },
      },
    });

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = makeAccessToken({
      sub: user.id,
      role: user.role,
      collegeId: user.collegeId,
      email: user.email,
    });

    // Option: issue a refresh token and set as HttpOnly cookie here (recommended)
    // const refreshToken = createRefreshToken(...); res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax' });

    const { password: _p, ...safeUser } = user;
    return res.json({ message: 'Login successful', token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

/* ---------- Auth middleware (verifies token and reloads user) ---------- */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Missing token' });
    const token = parts[1];
    if (!JWT_SECRET) return res.status(500).json({ error: 'JWT not configured' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = Number(decoded.sub || decoded.id);
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

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
        createdClubs: { select: { id: true, name: true } }, // adjust if your relation name differs
        college: { select: { id: true, name: true, code: true, logo: true } },
      },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    // attach to req for handlers
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/* ---------- getMe (uses req.user set by middleware) ---------- */
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ user: req.user });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/* ---------- verifyToken (simple health-check of token) ---------- */
export const verifyToken = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ valid: false });
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
