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


/* ------------------------ Get My Created Clubs (Organizer/Admin) ------------------------ */
export const getMyClubs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const clubs = await prisma.club.findMany({
      where: {
        createdBy: userId,
        isDeleted: false,
      },
      include: {
        college: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            memberships: true,
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedClubs = clubs.map((c) => ({
      ...c,
      memberCount: c._count.memberships,
      eventCount: c._count.events,
      _count: undefined,
    }));

    return res.json({
      message: 'Clubs fetched successfully',
      data: formattedClubs,
    });
  } catch (err) {
    console.error('❌ getMyClubs Error:', err);
    return res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

/* ------------------------ Get Club Membership Requests (Organizer/Admin) ------------------------ */
export const getClubMembershipRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get clubs created by this user
    const myClubs = await prisma.club.findMany({
      where: {
        createdBy: userId,
        isDeleted: false,
      },
      select: { id: true },
    });

    const clubIds = myClubs.map((c) => c.id);
    if (clubIds.length === 0) {
      return res.json({
        message: 'No membership requests found',
        data: [],
      });
    }

    const requests = await prisma.clubMembership.findMany({
      where: {
        clubId: { in: clubIds },
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            college: { select: { id: true, name: true, code: true } },
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            college: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      message: 'Membership requests fetched successfully',
      data: requests,
      count: requests.length,
    });
  } catch (err) {
    console.error('❌ getClubMembershipRequests Error:', err);
    return res.status(500).json({ error: 'Failed to fetch membership requests' });
  }
};

/* ------------------------ Approve/Reject Club Membership ------------------------ */
export const updateMembershipStatus = async (req, res) => {
  try {
    const membershipId = Number(req.params.id);
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!membershipId || Number.isNaN(membershipId)) {
      return res.status(400).json({ error: 'Invalid membership ID' });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    // Get membership with club info
    const membership = await prisma.clubMembership.findUnique({
      where: { id: membershipId },
      include: {
        club: { select: { id: true, createdBy: true } },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    // Verify user is the creator of the club
    if (membership.club.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: You can only manage memberships for your clubs' });
    }

    // Update membership
    const updated = await prisma.clubMembership.update({
      where: { id: membershipId },
      data: {
        status,
        joinedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      message: `Membership ${status.toLowerCase()} successfully`,
      data: updated,
    });
  } catch (err) {
    console.error('❌ updateMembershipStatus Error:', err);
    return res.status(500).json({ error: 'Failed to update membership status' });
  }
};

/* ------------------------ Get My Club Memberships (Student) ------------------------ */
export const getMyMemberships = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.clubMembership.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] }, // Only show active/pending memberships
      },
      include: {
        club: {
          include: {
            college: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      message: 'Memberships fetched successfully',
      data: memberships.map((m) => ({
        id: m.id,
        clubId: m.clubId,
        status: m.status,
        joinedAt: m.joinedAt,
        createdAt: m.createdAt,
        club: m.club,
      })),
    });
  } catch (err) {
    console.error('❌ getMyMemberships Error:', err);
    return res.status(500).json({ error: 'Failed to fetch memberships' });
  }
};


/* ------------------------ Join Club (Student Registration) ------------------------ */
export const joinClub = async (req, res) => {
  try {
    const clubId = Number(req.params.id);
    const userId = req.user.id;

    if (isNaN(clubId))
      return res.status(400).json({ error: 'Invalid club ID' });

    // Verify club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId, isDeleted: false },
      include: { college: { select: { id: true } } },
    });

    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Check if user is from same college (optional requirement)
    if (req.user.collegeId !== club.collegeId) {
      return res.status(403).json({ error: 'You can only join clubs from your college' });
    }

    // Check if already a member
    const existing = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: { userId, clubId },
      },
    });

    if (existing) {
      if (existing.status === 'LEFT') {
        // Re-join by updating status
        const updated = await prisma.clubMembership.update({
          where: { id: existing.id },
          data: {
            status: 'PENDING',
            joinedAt: new Date(),
            leftAt: null,
          },
          include: {
            club: {
              include: {
                college: { select: { id: true, name: true, code: true } },
              },
            },
          },
        });

        return res.json({
          message: 'Membership request sent successfully',
          data: updated,
        });
      }

      return res.status(409).json({
        error: 'You are already a member or have a pending request for this club',
        membership: existing,
      });
    }

    // Create new membership request
    const membership = await prisma.clubMembership.create({
      data: {
        userId,
        clubId,
        status: 'PENDING',
        joinedAt: new Date(),
      },
      include: {
        club: {
          include: {
            college: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Membership request sent successfully',
      data: membership,
    });
  } catch (err) {
    console.error('❌ joinClub Error:', err);
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Membership already exists' });
    }
    return res.status(500).json({ error: 'Failed to join club' });
  }
};