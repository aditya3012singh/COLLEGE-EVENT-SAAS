import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ------------------------ Validation Schemas ------------------------ */

const createClubSchema = z.object({
  name: z.string().min(2),
  collegeId: z.union([z.string(), z.number()]).transform(Number),
});

const updateClubSchema = z.object({
  name: z.string().min(2).optional(),
});

/* ------------------------ Get All Clubs ------------------------ */
export const getAllClubs = async (req, res) => {
  try {
    const { collegeId, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), 100);

    const where = {
      isDeleted: false,
      ...(collegeId && { collegeId: Number(collegeId) }),
    };

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          college: { select: { id: true, name: true } },
          events: { select: { id: true, title: true, dateTime: true } },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.club.count({ where }),
    ]);

    return res.json({
      message: 'Clubs fetched successfully',
      data: clubs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('❌ getAllClubs Error:', err);
    return res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};


/* ------------------------ Get Club By ID ------------------------ */
export const getClubById = async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({
      where: { id: clubId, isDeleted: false },
      include: {
        college: { select: { id: true, name: true } },
        events: {
          select: { id: true, title: true, dateTime: true, visibility: true },
          orderBy: { dateTime: 'desc' },
        },
      },
    });

    if (!club) return res.status(404).json({ error: 'Club not found' });

    return res.json({
      message: 'Club fetched successfully',
      data: club,
    });
  } catch (err) {
    console.error('❌ getClubById Error:', err);
    return res.status(500).json({ error: 'Failed to fetch club details' });
  }
};


/* ------------------------ Create Club ------------------------ */
export const createClub = async (req, res) => {
  try {
    // ROLE CHECK
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only organizers/admins can create clubs' });
    }

    const parsed = createClubSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });

    const { name, collegeId } = parsed.data;
    const createdBy = req.user.id;

    // Validate college
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    // Prevent duplicates
    const duplicate = await prisma.club.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        collegeId,
        isDeleted: false,
      },
    });
    if (duplicate) {
      return res.status(409).json({ error: 'Club already exists in this college' });
    }

    // Create club
    const club = await prisma.club.create({
      data: {
        name: name.trim(),
        collegeId,
        createdBy,
      },
    });

    return res.status(201).json({
      message: 'Club created successfully',
      data: club,
    });
  } catch (err) {
    console.error('❌ createClub Error:', err);
    return res.status(500).json({ error: 'Failed to create club' });
  }
};


/* ------------------------ Update Club ------------------------ */
export const updateClub = async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    const parsed = updateClubSchema.safeParse(req.body);

    if (!parsed.success)
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });

    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId, isDeleted: false } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Prevent rename collision
    if (parsed.data.name) {
      const duplicate = await prisma.club.findFirst({
        where: {
          name: { equals: parsed.data.name, mode: 'insensitive' },
          collegeId: club.collegeId,
          isDeleted: false,
          NOT: { id: clubId },
        },
      });
      if (duplicate)
        return res.status(409).json({ error: 'Club name already exists in this college' });
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: { name: parsed.data.name?.trim() },
    });

    return res.json({
      message: 'Club updated successfully',
      data: updatedClub,
    });
  } catch (err) {
    console.error('❌ updateClub Error:', err);
    return res.status(500).json({ error: 'Failed to update club' });
  }
};


/* ------------------------ Delete Club (Soft Delete Recommended) ------------------------ */
export const deleteClub = async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId, isDeleted: false } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Check events
    const eventCount = await prisma.event.count({ where: { clubId } });
    if (eventCount > 0) {
      return res.status(400).json({ error: 'Cannot delete club with existing events' });
    }

    // Soft Delete
    await prisma.club.update({
      where: { id: clubId },
      data: { isDeleted: true },
    });

    return res.json({ message: 'Club deleted successfully' });
  } catch (err) {
    console.error('❌ deleteClub Error:', err);
    return res.status(500).json({ error: 'Failed to delete club' });
  }
};
