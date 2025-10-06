import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;
    const collegeId = req.user.collegeId;
    const createdBy = req.user.id;

    if (clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club || club.collegeId !== collegeId) {
        return res.status(400).json({ error: 'Invalid clubId for your college' });
      }
    }

    const event = await prisma.$transaction(async (prisma) => {
      const createdEvent = await prisma.event.create({
        data: {
          title,
          description,
          dateTime: new Date(dateTime),
          venue,
          collegeId,
          clubId: clubId || null,
          createdBy,
          visibility,
        },
      });

      if (visibility === 'SELECTED' && allowedColleges?.length) {
        for (let cId of allowedColleges) {
          await prisma.eventAllowedCollege.create({
            data: { eventId: createdEvent.id, collegeId: cId },
          });
        }
      }

      return createdEvent;
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;
    const eventId = parseInt(req.params.id);

    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    if (clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club || club.collegeId !== existingEvent.collegeId) {
        return res.status(400).json({ error: 'Invalid clubId for this event' });
      }
    }

    const updatedEvent = await prisma.$transaction(async (prisma) => {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          title,
          description,
          dateTime: dateTime ? new Date(dateTime) : undefined,
          venue,
          clubId: clubId || null,
          visibility,
        },
      });

      if (visibility === 'SELECTED' && allowedColleges?.length) {
        await prisma.eventAllowedCollege.deleteMany({ where: { eventId } });
        for (let cId of allowedColleges) {
          await prisma.eventAllowedCollege.create({
            data: { eventId, collegeId: cId },
          });
        }
      }

      return event;
    });

    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

    await prisma.event.delete({ where: { id: eventId } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { collegeId },
          { visibility: 'ALL' },
          { allowedColleges: { some: { collegeId } } },
        ],
      },
      include: { club: true, registrations: true },
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true, allowedColleges: true, registrations: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};
