// eventController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;
    const collegeId = req.user.collegeId;
    const createdBy = req.user.id;

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        dateTime: new Date(dateTime),
        venue,
        collegeId,
        clubId: clubId || null,
        createdBy,
        visibility
      }
    });

    // Handle SELECTED colleges
    if (visibility === 'SELECTED' && allowedColleges?.length) {
      for (let cId of allowedColleges) {
        await prisma.eventAllowedCollege.create({
          data: { eventId: event.id, collegeId: cId }
        });
      }
    }

    res.json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const { title, description, dateTime, venue, clubId, visibility, allowedColleges } = req.body;
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        venue,
        clubId: clubId || null,
        visibility
      }
    });

    // Update allowed colleges if visibility = SELECTED
    if (visibility === 'SELECTED' && allowedColleges?.length) {
      // Delete old allowed colleges
      await prisma.eventAllowedCollege.deleteMany({ where: { eventId } });
      // Add new allowed colleges
      for (let cId of allowedColleges) {
        await prisma.eventAllowedCollege.create({
          data: { eventId, collegeId: cId }
        });
      }
    }

    res.json({ message: 'Event updated', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    await prisma.event.delete({ where: { id: eventId } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all events visible to the user
export const getEvents = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { collegeId }, // own college events
          { visibility: 'ALL' }, // all colleges
          { allowedColleges: { some: { collegeId } } } // selected colleges
        ]
      },
      include: { club: true, registrations: true }
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true, allowedColleges: true, registrations: true }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
