import prisma from '../utils/prisma.js';
import { z } from 'zod';

/* ---------- Validation Schemas ---------- */
const createEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  dateTime: z.string(),
  venue: z.string().min(2),
  clubId: z.union([z.string(), z.number()]).optional().nullable().transform((v) => (v ? Number(v) : null)),
  visibility: z.enum(['OWN', 'SELECTED', 'ALL']),
  allowedColleges: z.array(z.union([z.string(), z.number()]).transform(Number)).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().int().optional().nullable(),
  currency: z.string().optional().nullable(),
});

const updateEventSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  dateTime: z.string().optional(),
  venue: z.string().min(2).optional(),
  clubId: z.union([z.string(), z.number()]).optional().nullable().transform((v) => (v ? Number(v) : null)),
  visibility: z.enum(['OWN', 'SELECTED', 'ALL']).optional(),
  allowedColleges: z.array(z.union([z.string(), z.number()]).transform(Number)).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().int().optional().nullable(),
  currency: z.string().optional().nullable(),
});

const listEventsSchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((v) => (v ? Math.max(1, Number(v)) : 1)),
  limit: z.union([z.string(), z.number()]).optional().transform((v) => (v ? Math.min(Number(v), 100) : 10)),
  search: z.string().optional().nullable(),
  visibility: z.enum(['OWN', 'SELECTED', 'ALL']).optional(),
});

/* ---------- Helpers ---------- */
function parseDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function uniqInts(arr = []) {
  return Array.from(new Set(arr.map((n) => Number(n)).filter((x) => Number.isInteger(x) && x > 0)));
}

/* ---------- Create Event Service ---------- */
export const createEventService = async (data, userId, userRole, userCollegeId) => {
  if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Forbidden: insufficient role' };
  }

  const parsed = createEventSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid payload', issues: parsed.error.format() };
  }

  const payload = parsed.data;
  const eventDate = parseDate(payload.dateTime);
  if (!eventDate) {
    throw { status: 400, message: 'Invalid dateTime format' };
  }

  // Validate clubId if provided
  if (payload.clubId) {
    const club = await prisma.club.findUnique({
      where: { id: payload.clubId },
      select: { id: true, collegeId: true },
    });
    if (!club) {
      throw { status: 400, message: 'clubId does not exist' };
    }
    if (club.collegeId !== userCollegeId) {
      throw { status: 403, message: 'Invalid clubId for your college' };
    }
  }

  // Handle visibility and allowedColleges
  let allowedCollegeIds = [];
  if (payload.visibility === 'SELECTED') {
    allowedCollegeIds = uniqInts(payload.allowedColleges || []);
    if (!allowedCollegeIds.length) {
      throw {
        status: 400,
        message: 'allowedColleges must be a non-empty array when visibility is SELECTED',
      };
    }
    allowedCollegeIds = allowedCollegeIds.filter((c) => c !== userCollegeId);
    if (!allowedCollegeIds.length) {
      throw {
        status: 400,
        message: 'allowedColleges cannot only contain your own college',
      };
    }
  }

  const createdEvent = await prisma.$transaction(async (tx) => {
    const e = await tx.event.create({
      data: {
        title: payload.title.trim(),
        description: payload.description?.trim() ?? '',
        dateTime: eventDate,
        venue: payload.venue.trim(),
        collegeId: userCollegeId,
        clubId: payload.clubId || null,
        createdBy: userId,
        visibility: payload.visibility,
        isPaid: payload.isPaid ?? false,
        price: payload.price ?? null,
        currency: payload.currency ?? null,
      },
      select: {
        id: true,
        title: true,
        dateTime: true,
        venue: true,
        visibility: true,
        createdBy: true,
        collegeId: true,
        clubId: true,
        createdAt: true,
      },
    });

    if (payload.visibility === 'SELECTED' && allowedCollegeIds.length) {
      const rows = allowedCollegeIds.map((cId) => ({ eventId: e.id, collegeId: cId }));
      try {
        await tx.eventAllowedCollege.createMany({
          data: rows,
          skipDuplicates: true,
        });
      } catch (err) {
        if (err?.code === 'P2003') {
          throw Object.assign(new Error('Invalid allowedColleges (some colleges not found)'), {
            status: 400,
          });
        }
        throw err;
      }
    }
    return e;
  });

  return createdEvent;
};

/* ---------- Update Event Service ---------- */
export const updateEventService = async (eventId, data, userRole, userCollegeId) => {
  if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Forbidden: insufficient role' };
  }

  const id = Number(eventId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid event ID' };
  }

  const parsed = updateEventSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid payload', issues: parsed.error.format() };
  }

  const payload = parsed.data;

  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: { allowedColleges: true },
  });

  if (!existingEvent) {
    throw { status: 404, message: 'Event not found' };
  }

  if (userRole !== 'ADMIN' && existingEvent.collegeId !== userCollegeId) {
    throw { status: 403, message: 'Forbidden: cannot update event for other college' };
  }

  // Validate club if changed
  if (payload.clubId) {
    const club = await prisma.club.findUnique({
      where: { id: payload.clubId },
      select: { id: true, collegeId: true },
    });
    if (!club) {
      throw { status: 400, message: 'clubId does not exist' };
    }
    if (club.collegeId !== existingEvent.collegeId) {
      throw { status: 400, message: 'Invalid clubId for this event' };
    }
  }

  // Validate date if provided
  let parsedDate = existingEvent.dateTime;
  if (payload.dateTime) {
    const d = parseDate(payload.dateTime);
    if (!d) {
      throw { status: 400, message: 'Invalid dateTime format' };
    }
    parsedDate = d;
  }

  // Handle visibility / allowedColleges
  let allowedCollegeIds = null;
  if (payload.visibility === 'SELECTED' || (payload.allowedColleges && payload.allowedColleges.length)) {
    allowedCollegeIds = uniqInts(payload.allowedColleges || []);
    if (payload.visibility === 'SELECTED' && (!allowedCollegeIds || allowedCollegeIds.length === 0)) {
      throw {
        status: 400,
        message: 'allowedColleges must be a non-empty array when visibility is SELECTED',
      };
    }
    allowedCollegeIds = allowedCollegeIds.filter((c) => c !== existingEvent.collegeId);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.event.update({
      where: { id },
      data: {
        title: payload.title?.trim() ?? existingEvent.title,
        description: payload.description?.trim() ?? existingEvent.description,
        dateTime: parsedDate,
        venue: payload.venue?.trim() ?? existingEvent.venue,
        clubId: payload.clubId === undefined ? existingEvent.clubId : payload.clubId,
        visibility: payload.visibility ?? existingEvent.visibility,
        isPaid: payload.isPaid ?? existingEvent.isPaid,
        price: payload.price ?? existingEvent.price,
        currency: payload.currency ?? existingEvent.currency,
      },
    });

    if (payload.visibility === 'SELECTED' || allowedCollegeIds) {
      await tx.eventAllowedCollege.deleteMany({ where: { eventId: id } });
      if (allowedCollegeIds && allowedCollegeIds.length) {
        await tx.eventAllowedCollege.createMany({
          data: allowedCollegeIds.map((cId) => ({ eventId: id, collegeId: cId })),
          skipDuplicates: true,
        });
      }
    } else if (payload.visibility && payload.visibility !== 'SELECTED') {
      await tx.eventAllowedCollege.deleteMany({ where: { eventId: id } });
    }

    return u;
  });

  return updated;
};

/* ---------- Delete Event Service ---------- */
export const deleteEventService = async (eventId, userRole, userCollegeId) => {
  if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Forbidden: insufficient role' };
  }

  const id = Number(eventId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid event ID' };
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw { status: 404, message: 'Event not found' };
  }

  if (userRole !== 'ADMIN' && existingEvent.collegeId !== userCollegeId) {
    throw { status: 403, message: 'Forbidden: cannot delete event for other college' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.eventAllowedCollege.deleteMany({ where: { eventId: id } });
    await tx.registration.deleteMany({ where: { eventId: id } });
    await tx.event.delete({ where: { id } });
  });

  return { deletedEventId: id };
};

/* ---------- Get Events Service ---------- */
export const getEventsService = async (query, userCollegeId) => {
  if (!userCollegeId) {
    throw { status: 401, message: 'Unauthorized: missing user college' };
  }

  const parsed = listEventsSchema.safeParse(query);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid query', issues: parsed.error.format() };
  }

  const { page, limit, search, visibility } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      {
        OR: [
          { collegeId: userCollegeId },
          { visibility: 'ALL' },
          { allowedColleges: { some: { collegeId: userCollegeId } } },
        ],
      },
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      visibility ? { visibility } : undefined,
    ].filter(Boolean),
  };

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      include: {
        club: { select: { id: true, name: true } },
        allowedColleges: { select: { collegeId: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { dateTime: 'desc' },
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  const formatted = events.map((e) => ({
    id: e.id,
    title: e.title,
    dateTime: e.dateTime,
    venue: e.venue,
    visibility: e.visibility,
    isPaid: e.isPaid,
    price: e.price,
    currency: e.currency,
    club: e.club,
    allowedColleges: e.allowedColleges.map((ac) => ac.collegeId),
    registrationCount: e._count?.registrations ?? 0,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return {
    events: formatted,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/* ---------- Get My Events Service ---------- */
export const getMyEventsService = async (userId, query) => {
  const { page = 1, limit = 20 } = query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit), 100);
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        createdBy: userId,
        isDeleted: false,
      },
      include: {
        club: { select: { id: true, name: true } },
        college: { select: { id: true, name: true, code: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { dateTime: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.event.count({
      where: {
        createdBy: userId,
        isDeleted: false,
      },
    }),
  ]);

  const formattedEvents = events.map((e) => ({
    ...e,
    registrationCount: e._count.registrations,
    _count: undefined,
  }));

  return {
    events: formattedEvents,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/* ---------- Get Event By ID Service ---------- */
export const getEventByIdService = async (eventId, userCollegeId) => {
  const id = Number(eventId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid event ID' };
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: { select: { id: true, name: true, description: true } },
      college: { select: { id: true, name: true, code: true } },
      allowedColleges: { select: { college: { select: { id: true, name: true, code: true } } } },
      registrations: { select: { id: true, userId: true, attended: true, paymentStatus: true } },
    },
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  // Authorization check for visibility
  if (
    event.collegeId !== userCollegeId &&
    event.visibility !== 'ALL' &&
    !event.allowedColleges.some((a) => a.college?.id === userCollegeId)
  ) {
    throw { status: 403, message: 'Access denied for this event' };
  }

  const formattedEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    dateTime: event.dateTime,
    venue: event.venue,
    visibility: event.visibility,
    isPaid: event.isPaid,
    price: event.price,
    currency: event.currency,
    college: event.college,
    club: event.club,
    allowedColleges: event.allowedColleges.map((a) => a.college),
    registrationCount: event.registrations.length,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };

  return formattedEvent;
};
