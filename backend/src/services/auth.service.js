import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateAccessToken, verifyAccessToken } from '../utils/jwt.js';
import { getEnv } from '../utils/env.js';

/* ---------- Config ---------- */
const BCRYPT_ROUNDS = Number(getEnv('BCRYPT_ROUNDS', '12'));

/* ---------- Validation Schemas ---------- */
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
// Token generation is centralized in utils/jwt.js (generateAccessToken)

/* ---------- Register Service ---------- */
export const registerService = async (data) => {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    throw {
      status: 400,
      message: 'Invalid input',
      issues: parsed.error.format(),
    };
  }

  const { name, email, password, role, collegeId } = parsed.data;

  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { id: true, name: true, code: true },
  });

  if (!college) {
    throw { status: 404, message: 'College not found' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw { status: 409, message: 'Email already registered' };
  }

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

  const token = generateAccessToken({
    sub: user.id,
    role: user.role,
    collegeId: user.collegeId,
    email: user.email,
  });

  return { token, user };
};

/* ---------- Login Service ---------- */
export const loginService = async (data) => {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    throw {
      status: 400,
      message: 'Invalid input',
      issues: parsed.error.format(),
    };
  }
  console.log('Login attempt for:', parsed.data.email);
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

  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = generateAccessToken({
    sub: user.id,
    role: user.role,
    collegeId: user.collegeId,
    email: user.email,
  });

  const { password: _p, ...safeUser } = user;
  return { token, user: safeUser };
};

/* ---------- Verify Token Service ---------- */
export const verifyTokenService = (token) => {
  try {
    const decoded = verifyAccessToken(token);
    return { valid: true, decoded };
  } catch (e) {
    const message = e?.message || 'Invalid or expired token';
    throw { status: 401, message };
  }
};

/* ---------- Get User By ID Service ---------- */
export const getUserByIdService = async (userId) => {
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
      createdClubs: { select: { id: true, name: true } },
      college: { select: { id: true, name: true, code: true, logo: true } },
    },
  });

  if (!user) {
    throw { status: 401, message: 'User not found' };
  }

  return user;
};
