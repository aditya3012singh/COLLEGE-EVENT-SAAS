// controllers/college.js
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ---------------- Validation Schemas ---------------- */
const createCollegeSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  logo: z.string().url().optional().nullable(),
});

const listCollegesSchema = z.object({
  limit: z.union([z.string(), z.number()]).optional().transform((v) => (v ? Number(v) : 100)),
  skip: z.union([z.string(), z.number()]).optional().transform((v) => (v ? Number(v) : 0)),
});

const updateCollegeSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  logo: z.string().url().optional().nullable(),
});

/* ---------------- Helpers ---------------- */
const MAX_LIMIT = 200;

function normalizeCode(code) {
  return String(code).toUpperCase().trim();
}

/* ---------------- Create College (ADMIN only) ---------------- */
export const createCollege = async (req, res) => {
  try {
    // role guard
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create colleges' });
    }

    const parsed = createCollegeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });
    }

    const { name, code, logo } = parsed.data;
    const normalizedCode = normalizeCode(code);

    // uniqueness check
    const existing = await prisma.college.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      return res.status(409).json({ error: 'College code already exists' });
    }

    const college = await prisma.college.create({
      data: {
        name: name.trim(),
        code: normalizedCode,
        logo: logo ?? null,
      },
      select: { id: true, name: true, code: true, logo: true, createdAt: true },
    });

    return res.status(201).json({ message: 'College created successfully', college });
  } catch (err) {
    console.error('Create college error:', err);
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'College code must be unique' });
    }
    return res.status(500).json({
      error: 'Failed to create college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/* ---------------- Get All Colleges ---------------- */
export const getAllColleges = async (req, res) => {
  try {
    const parsed = listCollegesSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query params', issues: parsed.error.format() });
    }

    let { limit, skip } = parsed.data;
    limit = Math.min(limit || 100, MAX_LIMIT);
    skip = Math.max(0, skip || 0);

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        select: { id: true, name: true, code: true, logo: true, createdAt: true },
        orderBy: { name: 'asc' },
      }),
      prisma.college.count({ where: { isDeleted: false } }),
    ]);

    return res.status(200).json({
      message: 'Colleges retrieved successfully',
      count: colleges.length,
      total,
      colleges,
      pagination: { skip, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get all colleges error:', err);
    return res.status(500).json({
      error: 'Failed to fetch colleges',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/* ---------------- Get College By ID (includes clubs + events) ---------------- */
export const getCollegeById = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);
    if (!collegeId || Number.isNaN(collegeId) || collegeId <= 0) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        createdAt: true,
        // only non-deleted clubs/events
        clubs: {
          where: { isDeleted: false },
          select: { id: true, name: true, description: true, createdBy: true, createdAt: true },
        },
        events: {
          where: { isDeleted: false },
          select: {
            id: true,
            title: true,
            description: true,
            dateTime: true,
            venue: true,
            createdBy: true,
            createdAt: true,
            isPaid: true,
          },
          take: 10,
          orderBy: { dateTime: 'desc' },
        },
      },
    });

    if (!college) return res.status(404).json({ error: 'College not found' });

    return res.status(200).json({ message: 'College fetched successfully', college });
  } catch (err) {
    console.error('Get college by ID error:', err);
    return res.status(500).json({
      error: 'Failed to fetch college details',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/* ---------------- Update College (ADMIN only) ---------------- */
export const updateCollege = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update colleges' });
    }

    const collegeId = Number(req.params.id);
    if (!collegeId || Number.isNaN(collegeId) || collegeId <= 0) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    const parsed = updateCollegeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });

    const existing = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!existing) return res.status(404).json({ error: 'College not found' });

    const data = {};
    if (parsed.data.name) data.name = parsed.data.name.trim();
    if (parsed.data.logo !== undefined) data.logo = parsed.data.logo ?? null;
    if (parsed.data.code) {
      const normalizedCode = normalizeCode(parsed.data.code);
      if (normalizedCode !== existing.code) {
        // check uniqueness
        const codeExists = await prisma.college.findUnique({ where: { code: normalizedCode } });
        if (codeExists) return res.status(409).json({ error: 'College code already exists' });
      }
      data.code = normalizedCode;
    }

    const updated = await prisma.college.update({
      where: { id: collegeId },
      data,
      select: { id: true, name: true, code: true, logo: true, createdAt: true },
    });

    return res.status(200).json({ message: 'College updated successfully', college: updated });
  } catch (err) {
    console.error('Update college error:', err);
    return res.status(500).json({
      error: 'Failed to update college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/* ---------------- Delete College (soft delete recommended) ---------------- */
export const deleteCollege = async (req, res) => {
  try {
    // only admins
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete colleges' });
    }

    const collegeId = Number(req.params.id);
    if (!collegeId || Number.isNaN(collegeId) || collegeId <= 0) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    const existing = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!existing) return res.status(404).json({ error: 'College not found' });

    // If you want strict FK check: attempt delete and handle P2003
    // Prefer soft delete if isDeleted field exists:
    if (existing.isDeleted === undefined) {
      // no soft-delete field available: attempt hard delete
      try {
        const deleted = await prisma.college.delete({ where: { id: collegeId }, select: { id: true, name: true, code: true } });
        return res.status(200).json({ message: 'College deleted successfully', college: deleted });
      } catch (prismaErr) {
        if (prismaErr?.code === 'P2003') {
          return res.status(409).json({ error: 'Cannot delete college with associated records (users, clubs, events)' });
        }
        throw prismaErr;
      }
    } else {
      // Soft delete path
      await prisma.college.update({ where: { id: collegeId }, data: { isDeleted: true } });
      return res.status(200).json({ message: 'College deleted (soft) successfully' });
    }
  } catch (err) {
    console.error('Delete college error:', err);
    return res.status(500).json({
      error: 'Failed to delete college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};
