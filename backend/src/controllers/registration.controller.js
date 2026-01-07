import {
  registerEventService,
  checkInEventService,
  razorpayWebhookService,
  getRegistrationDetailsService,
  cancelRegistrationService,
} from '../services/registration.service.js';

/**
 * Register for an event
 */
export const registerEventController = async (req, res) => {
  try {
    const registration = await registerEventService(req.body, req.user.id, req.user.collegeId);
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
    const result = await razorpayWebhookService(req.body);
    return res.status(result.status).json(result.data);
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
export const getRegistrationDetailsController = async (req, res) => {
  try {
    const registration = await getRegistrationDetailsService(req.params.id);
    return res.json({
      message: 'Registration details fetched successfully',
      data: registration,
    });
  } catch (err) {
    console.error('getRegistrationDetails Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch registration details' });
  }
};

/**
 * Cancel registration
 */
export const cancelRegistrationController = async (req, res) => {
  try {
    const registration = await cancelRegistrationService(req.params.id, req.user.id, req.user.role);
    return res.json({
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (err) {
    console.error('cancelRegistration Error:', err);
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to cancel registration' });
  }
};
