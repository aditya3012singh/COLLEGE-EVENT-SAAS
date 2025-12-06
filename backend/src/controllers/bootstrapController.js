// controllers/bootstrapController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();

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
 * Bootstrap endpoint - Creates first admin and college
 * Only works if no colleges exist in database (safety check)
 */
export const bootstrap = async (req, res) => {
  try {
    // Safety check: Only allow bootstrap if no colleges exist
    const existingColleges = await prisma.college.count();
    if (existingColleges > 0) {
      return res.status(403).json({
        error: 'Bootstrap is only allowed when no colleges exist. System already initialized.',
      });
    }

    const parsed = bootstrapSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });
    }

    const { college: collegeData, admin: adminData } = parsed.data;

    // Normalize college code
    const normalizedCode = String(collegeData.code).toUpperCase().trim();

    // Check if college code already exists (shouldn't happen but double-check)
    const existing = await prisma.college.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      return res.status(409).json({ error: 'College code already exists' });
    }

    // Normalize email
    const normalizedEmail = adminData.email.toLowerCase().trim();

    // Check if admin email already exists
    const existingAdmin = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin email already registered' });
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

    return res.status(201).json({
      message: 'Bootstrap completed successfully. Admin and college created.',
      college: result.college,
      admin: {
        ...result.admin,
        password: '***hidden***',
      },
      note: 'Please login with the admin credentials to access the system.',
    });
  } catch (err) {
    console.error('Bootstrap error:', err);
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'College code or email already exists' });
    }
    return res.status(500).json({
      error: 'Bootstrap failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

