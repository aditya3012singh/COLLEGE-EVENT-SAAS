import prisma from '../utils/prisma.js';
import { z } from 'zod';

/* ---------- Validation Schemas ---------- */
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

/* ---------- Helpers ---------- */
const MAX_LIMIT = 200;

function normalizeCode(code) {
  return String(code).toUpperCase().trim();
}

/* ---------- Create College Service ---------- */
export const createCollegeService = async (data, userRole) => {
  if (userRole !== 'ADMIN') {
    throw { status: 403, message: 'Only admins can create colleges' };
  }

  const parsed = createCollegeSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const { name, code, logo } = parsed.data;
  const normalizedCode = normalizeCode(code);

  const existing = await prisma.college.findUnique({
    where: { code: normalizedCode },
  });

  if (existing) {
    throw { status: 409, message: 'College code already exists' };
  }

  const college = await prisma.college.create({
    data: {
      name: name.trim(),
      code: normalizedCode,
      logo: logo ?? null,
    },
    select: { id: true, name: true, code: true, logo: true, createdAt: true },
  });

  return college;
};

/* ---------- Get All Colleges Service ---------- */
export const getAllCollegesService = async (query) => {
  const parsed = listCollegesSchema.safeParse(query);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid query params', issues: parsed.error.format() };
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

  return {
    colleges,
    total,
    count: colleges.length,
    pagination: { skip, limit, totalPages: Math.ceil(total / limit) },
  };
};

/* ---------- Get College By ID Service ---------- */
export const getCollegeByIdService = async (collegeId) => {
  const id = Number(collegeId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid college ID' };
  }

  const college = await prisma.college.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      logo: true,
      createdAt: true,
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

  if (!college) {
    throw { status: 404, message: 'College not found' };
  }

  return college;
};

/* ---------- Update College Service ---------- */
export const updateCollegeService = async (collegeId, data, userRole) => {
  if (userRole !== 'ADMIN') {
    throw { status: 403, message: 'Only admins can update colleges' };
  }

  const id = Number(collegeId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid college ID' };
  }

  const parsed = updateCollegeSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const existing = await prisma.college.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'College not found' };
  }

  const updateData = {};
  if (parsed.data.name) updateData.name = parsed.data.name.trim();
  if (parsed.data.logo !== undefined) updateData.logo = parsed.data.logo ?? null;
  if (parsed.data.code) {
    const normalizedCode = normalizeCode(parsed.data.code);
    if (normalizedCode !== existing.code) {
      const codeExists = await prisma.college.findUnique({
        where: { code: normalizedCode },
      });
      if (codeExists) {
        throw { status: 409, message: 'College code already exists' };
      }
    }
    updateData.code = normalizedCode;
  }

  const updated = await prisma.college.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, code: true, logo: true, createdAt: true },
  });

  return updated;
};

/* ---------- Delete College Service ---------- */
export const deleteCollegeService = async (collegeId, userRole) => {
  if (userRole !== 'ADMIN') {
    throw { status: 403, message: 'Only admins can delete colleges' };
  }

  const id = Number(collegeId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid college ID' };
  }

  const existing = await prisma.college.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'College not found' };
  }

  if (existing.isDeleted === undefined) {
    try {
      const deleted = await prisma.college.delete({
        where: { id },
        select: { id: true, name: true, code: true },
      });
      return deleted;
    } catch (prismaErr) {
      if (prismaErr?.code === 'P2003') {
        throw {
          status: 409,
          message: 'Cannot delete college with associated records (users, clubs, events)',
        };
      }
      throw prismaErr;
    }
  } else {
    await prisma.college.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { message: 'College deleted (soft) successfully' };
  }
};
