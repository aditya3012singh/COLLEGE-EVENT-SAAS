import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

      if (visibility === 'SELECTED' && Array.isArray(allowedColleges) && allowedColleges.length > 0) {
        const validIds = allowedColleges.filter((id) => Number.isInteger(id) && id > 0);

        await tx.eventAllowedCollege.createMany({
          data: validIds.map((cId) => ({
            eventId: createdEvent.id,
            collegeId: cId,
          })),
        });
      }

      return createdEvent;
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    console.error('Create event error:', err);

    // ✅ Handle Prisma errors
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid foreign key reference (collegeId or clubId)',
      });
    }

    res.status(500).json({
      error: 'Failed to create event',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const {
      title,
      description,
      dateTime,
      venue,
      clubId,
      visibility,
      allowedColleges,
    } = req.body;

    // Fetch the existing event
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { allowedColleges: true },
    });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate optional clubId
    if (clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club || club.collegeId !== existingEvent.collegeId) {
        return res.status(400).json({ error: 'Invalid clubId for this event' });
      }
    }

    // Validate visibility enum
    const validVisibilities = ['OWN', 'SELECTED', 'ALL'];
    if (visibility && !validVisibilities.includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    // Validate allowedColleges
    if (visibility === 'SELECTED' && (!Array.isArray(allowedColleges) || allowedColleges.length === 0)) {
      return res.status(400).json({ error: 'allowedColleges must be a non-empty array when visibility is SELECTED' });
    }

    // Update event transactionally
    const updatedEvent = await prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          title: title ?? existingEvent.title,
          description: description ?? existingEvent.description,
          dateTime: dateTime ? new Date(dateTime) : existingEvent.dateTime,
          venue: venue ?? existingEvent.venue,
          clubId: clubId || null,
          visibility: visibility ?? existingEvent.visibility,
        },
      });

      // Handle allowed colleges for SELECTED visibility
      if (visibility === 'SELECTED') {
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
        await tx.eventAllowedCollege.createMany({
          data: allowedColleges.map((cId) => ({
            eventId,
            collegeId: cId,
          })),
        });
      } else {
        // Clean up if visibility changed away from SELECTED
        await tx.eventAllowedCollege.deleteMany({ where: { eventId } });
      }

      return updated;
    });

    return res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    console.error('Error updating event:', err);
    return res.status(500).json({
      error: 'Failed to update event',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};


export const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    // Validate eventId
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { allowedColleges: true },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Perform transaction for clean deletion
    await prisma.$transaction(async (tx) => {
      // Delete allowedColleges entries if any
      await tx.eventAllowedCollege.deleteMany({
        where: { eventId },
      });

      // Delete the main event
      await tx.event.delete({
        where: { id: eventId },
      });
    });

    return res.status(200).json({
      message: 'Event deleted successfully',
      deletedEventId: eventId,
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    return res.status(500).json({
      error: 'Failed to delete event',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    // Ensure user and college context exists
    if (!req.user || !req.user.collegeId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user or college context' });
    }

    const collegeId = req.user.collegeId;

    // Pagination parameters (default: page=1, limit=10)
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.max(1, parseInt(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    // Optional filters
    const search = req.query.search?.trim() || '';
    const visibilityFilter = req.query.visibility;

    const whereClause = {
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

    // Fetch events with pagination and filters
    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where: whereClause,
        include: {
          club: { select: { id: true, name: true } },
          registrations: { select: { id: true, userId: true } },
          allowedColleges: { select: { collegeId: true } },
        },
        orderBy: { dateTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: 'Events fetched successfully',
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      events,
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({
      error: 'Failed to fetch events',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
import { prisma } from '../config/prisma.js';

export const getEventById = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const collegeId = req.user?.collegeId;

    // Validate ID
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { id: true, name: true, description: true } },
        allowedColleges: {
          select: { college: { select: { id: true, name: true, code: true } } },
        },
        registrations: {
          select: {
            id: true,
            userId: true,
            attended: true,
            paymentStatus: true,
          },
        },
        college: { select: { id: true, name: true, code: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Authorization check — user should see only allowed events
    if (
      event.collegeId !== collegeId &&
      event.visibility !== 'ALL' &&
      !event.allowedColleges.some(
        (a) => a.college.id === collegeId
      )
    ) {
      return res.status(403).json({ error: 'Access denied for this event' });
    }

    // Format response
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
    console.error('Error fetching event by ID:', err);
    return res.status(500).json({
      error: 'Failed to fetch event',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
