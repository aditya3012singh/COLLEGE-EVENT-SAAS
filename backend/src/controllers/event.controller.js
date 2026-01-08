import {
  getEventsService,
  getMyEventsService,
  getEventByIdService,
  createEventService,
  updateEventService,
  deleteEventService,
} from '../services/event.service.js';

/**
 * Get all events
 */
export const getAllEventsController = async (req, res) => {
  try {
    const result = await getEventsService(req.query, req.user.collegeId);
    return res.json({
      message: 'Events fetched successfully',
      data: result.events,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('getAllEvents Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * Get event by ID
 */
export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id, req.user.collegeId);
    return res.json({
      message: 'Event fetched successfully',
      data: event,
    });
  } catch (err) {
    console.error('getEventById Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch event details' });
  }
};

/**
 * Create event
 */
export const createEventController = async (req, res) => {
  try {
    const event = await createEventService(req.body, req.user.id, req.user.role, req.user.collegeId);
    return res.status(201).json({
      message: 'Event created successfully',
      data: event,
    });
  } catch (err) {
    console.error('createEvent Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to create event' });
  }
};

/**
 * Update event
 */
export const updateEventController = async (req, res) => {
  try {
    const event = await updateEventService(req.params.id, req.body, req.user.role, req.user.collegeId);
    return res.json({
      message: 'Event updated successfully',
      data: event,
    });
  } catch (err) {
    console.error('updateEvent Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to update event' });
  }
};

/**
 * Delete event
 */
export const deleteEventController = async (req, res) => {
  try {
    await deleteEventService(req.params.id, req.user.role, req.user.collegeId);
    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('deleteEvent Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to delete event' });
  }
};

/**
 * Get my events (events created by current user)
 */
export const getMyEventsController = async (req, res) => {
  try {
    const result = await getMyEventsService(req.user.id, req.query);
    return res.json({
      message: 'My events fetched successfully',
      data: result.events,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('getMyEvents Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch my events' });
  }
};
