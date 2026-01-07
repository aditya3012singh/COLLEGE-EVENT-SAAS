import {
  getAllEventsService,
  getEventByIdService,
  createEventService,
  updateEventService,
  deleteEventService,
  updateEventVisibilityService,
} from '../services/event.service.js';

/**
 * Get all events
 */
export const getAllEventsController = async (req, res) => {
  try {
    const result = await getAllEventsService(req.query);
    return res.json({
      message: 'Events fetched successfully',
      data: result.events,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('getAllEvents Error:', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * Get event by ID
 */
export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id);
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
    const event = await updateEventService(req.params.id, req.body, req.user.id, req.user.role);
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
    await deleteEventService(req.params.id, req.user.id, req.user.role);
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
 * Update event visibility
 */
export const updateEventVisibilityController = async (req, res) => {
  try {
    const { visibility } = req.body;
    const event = await updateEventVisibilityService(req.params.id, visibility, req.user.id, req.user.role);
    return res.json({
      message: `Event visibility updated to ${visibility} successfully`,
      data: event,
    });
  } catch (err) {
    console.error('updateEventVisibility Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to update event visibility' });
  }
};
