import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// --- ENV Setup ---
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not set. Using default secret (NOT SECURE FOR PRODUCTION)');
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

/**
 * 🧑‍💻 Register User
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId } = req.body;

    if (!name || !email || !password || !role || !collegeId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'role', 'collegeId'],
      });
    }

    const validRoles = ['STUDENT', 'ORGANIZER', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid role', validRoles });
    }

    const college = await prisma.college.findUnique({
      where: { id: parseInt(collegeId) },
      select: { id: true, name: true, code: true },
    });

    if (!college) return res.status(404).json({ error: 'College not found' });

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser)
      return res.status(409).json({ error: 'Email already registered' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role.toUpperCase(),
        collegeId: parseInt(collegeId),
      },
      include: {
        college: { select: { id: true, name: true, code: true, logo: true } },
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        collegeId: user.collegeId,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 'P2002')
      return res.status(409).json({ error: 'Email already registered' });
    if (err.code === 'P2003')
      return res.status(400).json({ error: 'Invalid college ID' });

    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * 🔐 Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        college: { select: { id: true, name: true, code: true, logo: true } },
      },
    });

    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        collegeId: user.collegeId,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * 👤 Get Logged In User Profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        college: { select: { id: true, name: true, code: true, logo: true } },
        Club: { select: { id: true, name: true } }, // user’s created clubs
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * 🧾 Verify Token (used in frontend auto-login)
 */
export const verifyToken = async (req, res) => {
  try {
    res.json({
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
    res.status(500).json({ error: 'Token verification failed' });
  }
};
