import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

const bootstrapSchema = z.object({
  college: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    logo: z.string().url().optional().nullable(),
  }),
  admin: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

/**
 * Bootstrap service - Creates first admin and college
 * Only works if no colleges exist in database
 */
export const bootstrapService = async (data) => {
  // Safety check: Only allow bootstrap if no colleges exist
  const existingColleges = await prisma.college.count();
  if (existingColleges > 0) {
    throw {
      status: 403,
      message: 'Bootstrap is only allowed when no colleges exist. System already initialized.',
    };
  }

  const parsed = bootstrapSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const { college: collegeData, admin: adminData } = parsed.data;

  // Normalize college code
  const normalizedCode = String(collegeData.code).toUpperCase().trim();

  // Check if college code already exists
  const existing = await prisma.college.findUnique({
    where: { code: normalizedCode },
  });
  if (existing) {
    throw { status: 409, message: 'College code already exists' };
  }

  // Normalize email
  const normalizedEmail = adminData.email.toLowerCase().trim();

  // Check if admin email already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingAdmin) {
    throw { status: 409, message: 'Admin email already registered' };
  }

  // Create college and admin in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create college
    const college = await tx.college.create({
      data: {
        name: collegeData.name.trim(),
        code: normalizedCode,
        logo: collegeData.logo ?? null,
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, BCRYPT_ROUNDS);

    // Create admin user
    const admin = await tx.user.create({
      data: {
        name: adminData.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
        collegeId: college.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        createdAt: true,
      },
    });

    return { college, admin };
  });

  return result;
};
