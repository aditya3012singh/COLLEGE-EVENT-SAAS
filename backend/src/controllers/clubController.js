import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * ✅ Get all clubs (supports pagination + filtering by college)
 */
export const getAllClubs = async (req, res) => {
  try {
    const { collegeId, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), 100);

    const where = collegeId ? { collegeId: parseInt(collegeId) } : {};

    const [clubs, totalCount] = await Promise.all([
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

    return res.status(200).json({
      message: 'Clubs fetched successfully',
      data: clubs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    console.error('❌ getAllClubs Error:', err);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

/**
 * ✅ Get a specific club by ID (includes college + events)
 */
export const getClubById = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        college: { select: { id: true, name: true, address: true } },
        events: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            visibility: true,
          },
          orderBy: { dateTime: 'desc' },
        },
      },
    });

    if (!club) return res.status(404).json({ error: 'Club not found' });

    res.status(200).json({
      message: 'Club fetched successfully',
      data: club,
    });
  } catch (err) {
    console.error('❌ getClubById Error:', err);
    res.status(500).json({ error: 'Failed to fetch club details' });
  }
};

/**
 * ✅ Create a new club
 */
export const createClub = async (req, res) => {
  try {
    const { name, collegeId } = req.body;
    const createdBy = req.user?.id; // from auth middleware

    if (!name || !collegeId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'collegeId'],
      });
    }

    // Validate college
    const college = await prisma.college.findUnique({
      where: { id: parseInt(collegeId) },
    });
    if (!college)
      return res.status(404).json({ error: 'College not found' });

    // Prevent duplicate club name within same college
    const duplicate = await prisma.club.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        collegeId: parseInt(collegeId),
      },
    });
    if (duplicate)
      return res
        .status(409)
        .json({ error: 'A club with this name already exists in this college' });

    // Create club
    const club = await prisma.club.create({
      data: {
        name: name.trim(),
        collegeId: parseInt(collegeId),
        createdBy,
      },
    });

    res.status(201).json({
      message: 'Club created successfully',
      data: club,
    });
  } catch (err) {
    console.error('❌ createClub Error:', err);
    res.status(500).json({ error: 'Failed to create club' });
  }
};

/**
 * ✅ Update club details (e.g., name)
 */
export const updateClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const { name } = req.body;

    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });
    if (!existingClub)
      return res.status(404).json({ error: 'Club not found' });

    // Prevent renaming to an existing club name within the same college
    if (name) {
      const duplicate = await prisma.club.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          collegeId: existingClub.collegeId,
          NOT: { id: clubId },
        },
      });
      if (duplicate)
        return res
          .status(409)
          .json({ error: 'Club name already taken in this college' });
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: { name: name?.trim() },
    });

    res.status(200).json({
      message: 'Club updated successfully',
      data: updatedClub,
    });
  } catch (err) {
    console.error('❌ updateClub Error:', err);
    res.status(500).json({ error: 'Failed to update club' });
  }
};

/**
 * ✅ Delete a club safely (ensures no active events)
 */
export const deleteClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });
    if (!existingClub)
      return res.status(404).json({ error: 'Club not found' });

    // Check for existing events before deletion
    const activeEvents = await prisma.event.count({ where: { clubId } });
    if (activeEvents > 0) {
      return res.status(400).json({
        error:
          'Cannot delete club with active events. Please delete events first.',
      });
    }

    await prisma.club.delete({ where: { id: clubId } });

    res.status(200).json({ message: 'Club deleted successfully' });
  } catch (err) {
    console.error('❌ deleteClub Error:', err);
    res.status(500).json({ error: 'Failed to delete club' });
  }
};
