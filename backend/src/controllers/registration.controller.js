import {
  registerForEventService,
  checkInEventService,
  getRegistrationsService,
  getMyRegistrationsService,
  handleRazorpayWebhookService,
} from '../services/registration.service.js';

/**
 * Register for an event
 */
export const registerEventController = async (req, res) => {
  try {
    const registration = await registerForEventService(req.body, req.user.id);
    return res.status(201).json({
      message: 'Registration created successfully',
      data: registration,
    });
  } catch (err) {
    console.error('registerEvent Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, issues: err.issues });
    }
    return res.status(500).json({ error: 'Failed to register for event' });
  }
};

/**
 * Check-in to event
 */
export const checkInEventController = async (req, res) => {
  try {
    const registration = await checkInEventService(req.body.code, req.user.id, req.user.role);
    return res.json({
      message: 'Check-in successful',
      data: registration,
    });
  } catch (err) {
    console.error('checkInEvent Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to check-in' });
  }
};

/**
 * Razorpay webhook handler
 */
export const razorpayWebhookController = async (req, res) => {
  try {
    const result = await handleRazorpayWebhookService(req.rawBody, req.headers['x-razorpay-signature']);
    return res.status(200).json(result);
  } catch (err) {
    console.error('razorpayWebhook Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Get registration details
 */
export const getRegistrationsController = async (req, res) => {
  try {
    const registrations = await getRegistrationsService(req.params.eventId);
    return res.json({
      message: 'Registrations fetched successfully',
      data: registrations,
    });
  } catch (err) {
    console.error('getRegistrations Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

/**
 * Cancel registration
 */
export const getMyRegistrationsController = async (req, res) => {
  try {
    const registrations = await getMyRegistrationsService(req.user.id);
    return res.json({
      message: 'My registrations fetched successfully',
      data: registrations,
    });
  } catch (err) {
    console.error('getMyRegistrations Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch my registrations' });
  }
};
