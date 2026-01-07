import prisma from '../utils/prisma.js';

/* ---------- Validation Schemas ---------- */
const createClubSchema = z.object({
  name: z.string().min(2),
  collegeId: z.union([z.string(), z.number()]).transform(Number),
  description: z.string().optional(),
  department: z.string().optional(),
  domain: z.string().optional(),
  clubLeadId: z.union([z.string(), z.number()]).transform(Number).optional(),
});

const updateClubSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  department: z.string().optional(),
  domain: z.string().optional(),
  clubLeadId: z.union([z.string(), z.number()]).transform(Number).optional().nullable(),
});

/* ---------- Get All Clubs Service ---------- */
export const getAllClubsService = async (query) => {
  const { collegeId, page = 1, limit = 20 } = query;

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

  return {
    clubs,
    total,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/* ---------- Get Club By ID Service ---------- */
export const getClubByIdService = async (clubId) => {
  const id = Number(clubId);
  if (isNaN(id)) {
    throw { status: 400, message: 'Invalid club ID' };
  }

  const club = await prisma.club.findUnique({
    where: { id, isDeleted: false },
    include: {
      college: { select: { id: true, name: true, code: true } },
      creator: { select: { id: true, name: true, email: true } },
      clubLead: { select: { id: true, name: true, email: true } },
      domainLeads: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      achievements: {
        include: {
          member: { select: { id: true, name: true, email: true } },
        },
        orderBy: { achievedAt: 'desc' },
      },
      memberships: {
        where: { status: 'APPROVED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      events: {
        select: { id: true, title: true, dateTime: true, visibility: true },
        orderBy: { dateTime: 'desc' },
      },
      _count: {
        select: {
          memberships: true,
          events: true,
        },
      },
    },
  });

  if (!club) {
    throw { status: 404, message: 'Club not found' };
  }

  // Calculate alumni count
  const alumniCount = await prisma.clubMembership.count({
    where: {
      clubId: id,
      status: 'LEFT',
    },
  });

  return {
    ...club,
    memberCount: club._count.memberships,
    eventCount: club._count.events,
    alumniCount,
    _count: undefined,
  };
};

/* ---------- Create Club Service ---------- */
export const createClubService = async (data, userId, userRole) => {
  if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Only organizers/admins can create clubs' };
  }

  const parsed = createClubSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const { name, collegeId, description, department, domain, clubLeadId } = parsed.data;

  // Validate college
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
  });
  if (!college) {
    throw { status: 404, message: 'College not found' };
  }

  // Validate clubLead if provided
  if (clubLeadId) {
    const clubLead = await prisma.user.findUnique({
      where: { id: clubLeadId },
      select: { id: true, collegeId: true },
    });
    if (!clubLead) {
      throw { status: 404, message: 'Club lead user not found' };
    }
    if (clubLead.collegeId !== collegeId) {
      throw { status: 400, message: 'Club lead must be from the same college' };
    }
  }

  // Prevent duplicates
  const duplicate = await prisma.club.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      collegeId,
      isDeleted: false,
    },
  });
  if (duplicate) {
    throw { status: 409, message: 'Club already exists in this college' };
  }

  const club = await prisma.club.create({
    data: {
      name: name.trim(),
      collegeId,
      createdBy: userId,
      description: description?.trim() || null,
      department: department?.trim() || null,
      domain: domain?.trim() || null,
      clubLeadId: clubLeadId || null,
    },
  });

  return club;
};

/* ---------- Update Club Service ---------- */
export const updateClubService = async (clubId, data, userId, userRole) => {
  const id = Number(clubId);
  if (isNaN(id)) {
    throw { status: 400, message: 'Invalid club ID' };
  }

  const parsed = updateClubSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const club = await prisma.club.findUnique({
    where: { id, isDeleted: false },
  });
  if (!club) {
    throw { status: 404, message: 'Club not found' };
  }

  // Ownership check
  if (club.createdBy !== userId && userRole !== 'ADMIN') {
    throw { status: 403, message: 'You can only update clubs you created' };
  }

  // Prevent rename collision
  if (parsed.data.name) {
    const duplicate = await prisma.club.findFirst({
      where: {
        name: { equals: parsed.data.name, mode: 'insensitive' },
        collegeId: club.collegeId,
        isDeleted: false,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw { status: 409, message: 'Club name already exists in this college' };
    }
  }

  // Validate clubLead if provided
  if (parsed.data.clubLeadId !== undefined) {
    if (parsed.data.clubLeadId !== null) {
      const clubLead = await prisma.user.findUnique({
        where: { id: parsed.data.clubLeadId },
        select: { id: true, collegeId: true },
      });
      if (!clubLead) {
        throw { status: 404, message: 'Club lead user not found' };
      }
      if (clubLead.collegeId !== club.collegeId) {
        throw { status: 400, message: 'Club lead must be from the same college' };
      }
    }
  }

  const updateData = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name.trim();
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description?.trim() || null;
  if (parsed.data.department !== undefined) updateData.department = parsed.data.department?.trim() || null;
  if (parsed.data.domain !== undefined) updateData.domain = parsed.data.domain?.trim() || null;
  if (parsed.data.clubLeadId !== undefined) updateData.clubLeadId = parsed.data.clubLeadId || null;

  const updatedClub = await prisma.club.update({
    where: { id },
    data: updateData,
  });

  return updatedClub;
};

/* ---------- Delete Club Service ---------- */
export const deleteClubService = async (clubId, userId, userRole) => {
  const id = Number(clubId);
  if (isNaN(id)) {
    throw { status: 400, message: 'Invalid club ID' };
  }

  const club = await prisma.club.findUnique({
    where: { id, isDeleted: false },
  });
  if (!club) {
    throw { status: 404, message: 'Club not found' };
  }

  // Check events
  const eventCount = await prisma.event.count({
    where: { clubId: id },
  });
  if (eventCount > 0) {
    throw { status: 400, message: 'Cannot delete club with existing events' };
  }

  // Soft Delete
  await prisma.club.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { message: 'Club deleted successfully' };
};

/* ---------- Get My Clubs Service ---------- */
export const getMyClubsService = async (userId) => {
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

  return clubs.map((c) => ({
    ...c,
    memberCount: c._count.memberships,
    eventCount: c._count.events,
    _count: undefined,
  }));
};

/* ---------- Get Club Membership Requests Service ---------- */
export const getClubMembershipRequestsService = async (userId) => {
  const myClubs = await prisma.club.findMany({
    where: {
      createdBy: userId,
      isDeleted: false,
    },
    select: { id: true },
  });

  const clubIds = myClubs.map((c) => c.id);
  if (clubIds.length === 0) {
    return [];
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

  return requests;
};

/* ---------- Update Membership Status Service ---------- */
export const updateMembershipStatusService = async (membershipId, status, userId, userRole) => {
  const id = Number(membershipId);
  if (!id || Number.isNaN(id)) {
    throw { status: 400, message: 'Invalid membership ID' };
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw { status: 400, message: 'Invalid status. Must be APPROVED or REJECTED' };
  }

  const membership = await prisma.clubMembership.findUnique({
    where: { id },
    include: {
      club: { select: { id: true, createdBy: true } },
    },
  });

  if (!membership) {
    throw { status: 404, message: 'Membership not found' };
  }

  // Verify user is the creator or admin
  if (membership.club.createdBy !== userId && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Forbidden: You can only manage memberships for your clubs' };
  }

  const updated = await prisma.clubMembership.update({
    where: { id },
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

  return updated;
};

/* ---------- Get My Memberships Service ---------- */
export const getMyMembershipsService = async (userId) => {
  const memberships = await prisma.clubMembership.findMany({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED'] },
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

  return memberships.map((m) => ({
    id: m.id,
    clubId: m.clubId,
    status: m.status,
    joinedAt: m.joinedAt,
    createdAt: m.createdAt,
    club: m.club,
  }));
};

/* ---------- Join Club Service ---------- */
export const joinClubService = async (clubId, userId, userCollegeId) => {
  const id = Number(clubId);
  if (isNaN(id)) {
    throw { status: 400, message: 'Invalid club ID' };
  }

  const club = await prisma.club.findUnique({
    where: { id, isDeleted: false },
    include: { college: { select: { id: true } } },
  });

  if (!club) {
    throw { status: 404, message: 'Club not found' };
  }

  // Check if user is from same college
  if (userCollegeId !== club.collegeId) {
    throw { status: 403, message: 'You can only join clubs from your college' };
  }

  // Check if already a member
  const existing = await prisma.clubMembership.findUnique({
    where: {
      userId_clubId: { userId, clubId: id },
    },
  });

  if (existing) {
    if (existing.status === 'LEFT') {
      // Re-join
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

      return updated;
    }

    throw {
      status: 409,
      message: 'You are already a member or have a pending request for this club',
      membership: existing,
    };
  }

  // Create new membership request
  const membership = await prisma.clubMembership.create({
    data: {
      userId,
      clubId: id,
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

  return membership;
};
