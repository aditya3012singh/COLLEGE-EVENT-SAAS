// controllers/event.js
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ---------------------- Schemas ---------------------- */
const createEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  dateTime: z.string(), // ISO string or numeric timestamp accepted; validated below
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

/* ---------------------- Helpers ---------------------- */

function parseDate(value) {
  // Accept ISO or numeric timestamp strings
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function uniqInts(arr = []) {
  return Array.from(new Set(arr.map((n) => Number(n)).filter((x) => Number.isInteger(x) && x > 0)));
}

/* ---------------------- CREATE EVENT ---------------------- */
export const createEvent = async (req, res) => {
  try {
    // role guard: only ORGANIZER or ADMIN can create events
    if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.format() });
    }
    const payload = parsed.data;
    const { id: createdBy, collegeId } = req.user;

    // Validate and parse date
    const eventDate = parseDate(payload.dateTime);
    if (!eventDate) return res.status(400).json({ error: 'Invalid dateTime format' });

    // If clubId provided, validate ownership (club must belong to same college)
    if (payload.clubId) {
      const club = await prisma.club.findUnique({ where: { id: payload.clubId }, select: { id: true, collegeId: true } });
      if (!club) return res.status(400).json({ error: 'clubId does not exist' });
      if (club.collegeId !== collegeId) return res.status(403).json({ error: 'Invalid clubId for your college' });
    }

    // If SELECTED visibility, validate allowedColleges list
    let allowedCollegeIds = [];
    if (payload.visibility === 'SELECTED') {
      allowedCollegeIds = uniqInts(payload.allowedColleges || []);
      if (!allowedCollegeIds.length) {
        return res.status(400).json({ error: 'allowedColleges must be a non-empty array when visibility is SELECTED' });
      }
      // remove user's own college if included (usually redundant)
      allowedCollegeIds = allowedCollegeIds.filter((c) => c !== collegeId);
      if (!allowedCollegeIds.length) {
        return res.status(400).json({ error: 'allowedColleges cannot only contain your own college' });
      }
    }

    const createdEvent = await prisma.$transaction(async (tx) => {
      const e = await tx.event.create({
        data: {
          title: payload.title.trim(),
          description: payload.description?.trim() ?? '',
          dateTime: eventDate,
          venue: payload.venue.trim(),
          collegeId,
          clubId: payload.clubId || null,
          createdBy,
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
        // map to objects for createMany; duplicate pairs will be skipped by catching P2002
        const rows = allowedCollegeIds.map((cId) => ({ eventId: e.id, collegeId: cId }));
        try {
          await tx.eventAllowedCollege.createMany({ data: rows, skipDuplicates: true });
        } catch (err) {
          // skipDuplicates handles most cases; but keep this to catch other foreign key issues
          if (err?.code === 'P2003') {
            throw Object.assign(new Error('Invalid allowedColleges (some colleges not found)'), { status: 400 });
          }
          throw err;
        }
      }
      return e;
    });

    return res.status(201).json({ message: 'Event created successfully', event: createdEvent });
  } catch (err) {
    console.error('Create event error:', err);
    if (err?.status === 400) return res.status(400).json({ error: err.message });
    if (err?.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid foreign key reference (collegeId or clubId)' });
    }
    return res.status(500).json({ error: 'Failed to create event', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------------- UPDATE EVENT ---------------------- */
export const updateEvent = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    const eventId = Number(req.params.id);
    if (!eventId || Number.isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.format() });
    const payload = parsed.data;

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { allowedColleges: true },
    });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    // Only organizer of the college or admin can update. Optionally check creator:
    if (req.user.role !== 'ADMIN' && existingEvent.collegeId !== req.user.collegeId) {
      return res.status(403).json({ error: 'Forbidden: cannot update event for other college' });
    }

    // Validate club if changed
    if (payload.clubId) {
      const club = await prisma.club.findUnique({ where: { id: payload.clubId }, select: { id: true, collegeId: true } });
      if (!club) return res.status(400).json({ error: 'clubId does not exist' });
      if (club.collegeId !== existingEvent.collegeId) return res.status(400).json({ error: 'Invalid clubId for this event' });
    }

    // Validate date if provided
    let parsedDate = existingEvent.dateTime;
    if (payload.dateTime) {
      const d = parseDate(payload.dateTime);
      if (!d) return res.status(400).json({ error: 'Invalid dateTime format' });
      parsedDate = d;
    }

    // Handle visibility / allowedColleges semantics
    let allowedCollegeIds = null;
    if (payload.visibility === 'SELECTED' || (payload.allowedColleges && payload.allowedColleges.length)) {
      allowedCollegeIds = uniqInts(payload.allowedColleges || []);
      // ensure not empty when visibility is SELECTED
      if (payload.visibility === 'SELECTED' && (!allowedCollegeIds || allowedCollegeIds.length === 0)) {
        return res.status(400).json({ error: 'allowedColleges must be a non-empty array when visibility is SELECTED' });
      }
      // avoid including the event's own college
      allowedCollegeIds = allowedCollegeIds.filter((c) => c !== existingEvent.collegeId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.event.update({
        where: { id: eventId },
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

      // update allowed colleges depending on new visibility
      if (payload.visibility === 'SELECTED' || allowedCollegeIds) {
        // delete existing and replace
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
        if (allowedCollegeIds && allowedCollegeIds.length) {
          await tx.eventAllowedCollege.createMany({ data: allowedCollegeIds.map((cId) => ({ eventId, collegeId: cId })), skipDuplicates: true });
        }
      } else if (payload.visibility && payload.visibility !== 'SELECTED') {
        // if visibility changed away from SELECTED, remove any existing allowed rows
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
      }

      return u;
    });

    return res.status(200).json({ message: 'Event updated successfully', event: updated });
  } catch (err) {
    console.error('Update event error:', err);
    if (err?.code === 'P2003') return res.status(400).json({ error: 'Invalid foreign key reference' });
    return res.status(500).json({ error: 'Failed to update event', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------------- DELETE EVENT ---------------------- */
export const deleteEvent = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    const eventId = Number(req.params.id);
    if (!eventId || Number.isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    // Prevent deleting events from other colleges (unless admin)
    if (req.user.role !== 'ADMIN' && existingEvent.collegeId !== req.user.collegeId) {
      return res.status(403).json({ error: 'Forbidden: cannot delete event for other college' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
      await tx.registration.deleteMany({ where: { eventId } }); // optional: remove registrations first (or keep for audit)
      await tx.event.delete({ where: { id: eventId } });
    });

    return res.status(200).json({ message: 'Event deleted successfully', deletedEventId: eventId });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete event', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------------- GET EVENTS (list) ---------------------- */
export const getEvents = async (req, res) => {
  try {
    if (!req.user?.collegeId) {
      return res.status(401).json({ error: 'Unauthorized: missing user college' });
    }

    const parsed = listEventsSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid query', issues: parsed.error.format() });

    const { page, limit, search, visibility } = parsed.data;
    const skip = (page - 1) * limit;
    const collegeId = req.user.collegeId;

    // Build where clause
    const where = {
      AND: [
        {
          OR: [
            { collegeId },
            { visibility: 'ALL' },
            { allowedColleges: { some: { collegeId } } },
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

    // fetch events and count
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

    // format results: attach registrationCount from _count
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

    return res.status(200).json({
      message: 'Events fetched successfully',
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      events: formatted,
    });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ error: 'Failed to fetch events', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------------- GET EVENT BY ID ---------------------- */
export const getEventById = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const collegeId = req.user?.collegeId;

    if (!eventId || Number.isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true, name: true, description: true } },
        college: { select: { id: true, name: true, code: true } },
        allowedColleges: { select: { college: { select: { id: true, name: true, code: true } } } },
        registrations: { select: { id: true, userId: true, attended: true, paymentStatus: true } },
      },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Authorization check for visibility
    if (
      event.collegeId !== collegeId &&
      event.visibility !== 'ALL' &&
      !event.allowedColleges.some((a) => a.college?.id === collegeId)
    ) {
      return res.status(403).json({ error: 'Access denied for this event' });
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

    return res.status(200).json({ message: 'Event details fetched successfully', event: formattedEvent });
  } catch (err) {
    console.error('Get event by ID error:', err);
    return res.status(500).json({ error: 'Failed to fetch event', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};
