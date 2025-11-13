import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * ✅ Create College
 */
export const createCollege = async (req, res) => {
  try {
    const { name, code, logo } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'code'],
      });
    }

    const normalizedName = name.trim();
    const normalizedCode = code.toUpperCase().trim();

    // Check for existing college by code
    const existingCollege = await prisma.college.findUnique({
      where: { code: normalizedCode },
    });

    if (existingCollege) {
      return res.status(409).json({
        error: 'College code already exists',
        message: 'A college with this code already exists',
      });
    }

    const college = await prisma.college.create({
      data: {
        name: normalizedName,
        code: normalizedCode,
        logo: logo?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'College created successfully',
      college,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'College code must be unique' });
    }

    console.error('Create college error:', err);
    res.status(500).json({
      error: 'Failed to create college',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

/**
 * ✅ Get All Colleges
 */
export const getAllColleges = async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const colleges = await prisma.college.findMany({
      skip: Number(skip),
      take: Math.min(Number(limit), 100),
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      message: 'Colleges retrieved successfully',
      count: colleges.length,
      colleges,
    });
  } catch (err) {
    console.error('Get all colleges error:', err);
    res.status(500).json({
      error: 'Failed to fetch colleges',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

/**
 * ✅ Get College by ID (includes clubs & events)
 */
export const getCollegeById = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);
    if (!collegeId || isNaN(collegeId) || collegeId <= 0) {
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
        clubs: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
            createdAt: true,
          },
        },
        events: {
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
      return res.status(404).json({ error: 'College not found' });
    }

    res.status(200).json({
      message: 'College fetched successfully',
      college,
    });
  } catch (err) {
    console.error('Get college by ID error:', err);
    res.status(500).json({
      error: 'Failed to fetch college details',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

/**
 * ✅ Update College
 */
export const updateCollege = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);
    const { name, code, logo } = req.body;

    if (!collegeId || isNaN(collegeId) || collegeId <= 0) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    if (!name || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'code'],
      });
    }

    const existingCollege = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!existingCollege)
      return res.status(404).json({ error: 'College not found' });

    const normalizedCode = code.toUpperCase().trim();

    // Check for unique code if changed
    if (normalizedCode !== existingCollege.code) {
      const codeExists = await prisma.college.findUnique({
        where: { code: normalizedCode },
      });
      if (codeExists) {
        return res.status(409).json({ error: 'College code already exists' });
      }
    }

    const updatedCollege = await prisma.college.update({
      where: { id: collegeId },
      data: {
        name: name.trim(),
        code: normalizedCode,
        ...(logo && { logo: logo.trim() }),
      },
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: 'College updated successfully',
      college: updatedCollege,
    });
  } catch (err) {
    console.error('Update college error:', err);
    res.status(500).json({
      error: 'Failed to update college',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

/**
 * ✅ Delete College (with FK constraint handling)
 */
export const deleteCollege = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);

    if (!collegeId || isNaN(collegeId) || collegeId <= 0) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    const existingCollege = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!existingCollege)
      return res.status(404).json({ error: 'College not found' });

    try {
      const deletedCollege = await prisma.college.delete({
        where: { id: collegeId },
        select: { id: true, name: true, code: true },
      });

      return res.status(200).json({
        message: 'College deleted successfully',
        college: deletedCollege,
      });
    } catch (prismaErr) {
      if (prismaErr.code === 'P2003') {
        return res.status(409).json({
          error:
            'Cannot delete college with associated records (clubs, events, or users)',
        });
      }
      throw prismaErr;
    }
  } catch (err) {
    console.error('Delete college error:', err);
    res.status(500).json({
      error: 'Failed to delete college',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};
