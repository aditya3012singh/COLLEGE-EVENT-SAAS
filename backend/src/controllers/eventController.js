import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * CREATE EVENT
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;
    const { collegeId, id: createdBy } = req.user;

    if (!title || !dateTime || !venue || !visibility) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'dateTime', 'venue', 'visibility'],
      });
    }

    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dateTime format' });
    }

    const validVisibilities = ['OWN', 'SELECTED', 'ALL'];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({
        error: 'Invalid visibility',
        validValues: validVisibilities,
      });
    }

    // Validate club ownership
    if (clubId) {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { id: true, collegeId: true },
      });
      if (!club || club.collegeId !== collegeId) {
        return res.status(400).json({ error: 'Invalid clubId for your college' });
      }
    }

    const event = await prisma.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          title: title.trim(),
          description: description?.trim() || '',
          dateTime: eventDate,
          venue: venue.trim(),
          collegeId,
          clubId: clubId || null,
          createdBy,
          visibility,
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

      // If SELECTED visibility, add allowed colleges
      if (visibility === 'SELECTED' && Array.isArray(allowedColleges) && allowedColleges.length > 0) {
        const validIds = allowedColleges.filter((id) => Number.isInteger(id) && id > 0);
        if (validIds.length) {
          await tx.eventAllowedCollege.createMany({
            data: validIds.map((cId) => ({
              eventId: createdEvent.id,
              collegeId: cId,
            })),
          });
        }
      }

      return createdEvent;
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    console.error('Create event error:', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid foreign key reference (collegeId or clubId)' });
    }
    return res.status(500).json({
      error: 'Failed to create event',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * UPDATE EVENT
 */
export const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { allowedColleges: true },
    });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    // Validate club
    if (clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club || club.collegeId !== existingEvent.collegeId) {
        return res.status(400).json({ error: 'Invalid clubId for this event' });
      }
    }

    const validVisibilities = ['OWN', 'SELECTED', 'ALL'];
    if (visibility && !validVisibilities.includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    if (visibility === 'SELECTED' && (!Array.isArray(allowedColleges) || !allowedColleges.length)) {
      return res.status(400).json({
        error: 'allowedColleges must be a non-empty array when visibility is SELECTED',
      });
    }

    const updatedEvent = await prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          title: title?.trim() ?? existingEvent.title,
          description: description?.trim() ?? existingEvent.description,
          dateTime: dateTime ? new Date(dateTime) : existingEvent.dateTime,
          venue: venue?.trim() ?? existingEvent.venue,
          clubId: clubId || null,
          visibility: visibility ?? existingEvent.visibility,
        },
      });

      if (visibility === 'SELECTED') {
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
        await tx.eventAllowedCollege.createMany({
          data: allowedColleges.map((cId) => ({
            eventId,
            collegeId: cId,
          })),
        });
      } else {
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
      }

      return updated;
    });

    return res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({
      error: 'Failed to update event',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * DELETE EVENT
 */
export const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    await prisma.$transaction(async (tx) => {
      await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
      await tx.event.delete({ where: { id: eventId } });
    });

    return res.status(200).json({ message: 'Event deleted successfully', deletedEventId: eventId });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({
      error: 'Failed to delete event',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * GET ALL EVENTS (with pagination, filters)
 */
export const getEvents = async (req, res) => {
  try {
    if (!req.user?.collegeId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user or college context' });
    }

    const collegeId = req.user.collegeId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';
    const visibilityFilter = req.query.visibility;

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
          : {},
        visibilityFilter ? { visibility: visibilityFilter } : {},
      ],
    };

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        include: {
          club: { select: { id: true, name: true } },
          allowedColleges: { select: { collegeId: true } },
          registrations: { select: { id: true } },
        },
        orderBy: { dateTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return res.status(200).json({
      message: 'Events fetched successfully',
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      events,
    });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({
      error: 'Failed to fetch events',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

/**
 * GET EVENT BY ID
 */
export const getEventById = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const collegeId = req.user?.collegeId;

    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true, name: true, description: true } },
        college: { select: { id: true, name: true, code: true } },
        allowedColleges: {
          select: { college: { select: { id: true, name: true, code: true } } },
        },
        registrations: {
          select: { id: true, userId: true, attended: true, paymentStatus: true },
        },
      },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Authorization check
    if (
      event.collegeId !== collegeId &&
      event.visibility !== 'ALL' &&
      !event.allowedColleges.some((a) => a.college.id === collegeId)
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

    return res.status(200).json({
      message: 'Event details fetched successfully',
      event: formattedEvent,
    });
  } catch (err) {
    console.error('Get event by ID error:', err);
    return res.status(500).json({
      error: 'Failed to fetch event',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};
