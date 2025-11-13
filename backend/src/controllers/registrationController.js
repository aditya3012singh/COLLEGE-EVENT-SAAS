import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ✅ Check environment configuration
if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
  console.warn('⚠️ Razorpay keys not set — payment features may not work.');
}
if (!process.env.QR_SECRET) {
  console.warn('⚠️ QR_SECRET not set — use a secure secret in production.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * 🔒 Utility: Generate secure QR payload hash
 */
const generateQRPayload = (userId, eventId) => {
  const payload = `${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
};

/**
 * 1️⃣ Register user for an event (with optional Razorpay order)
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, paidAmount = 0, currency = 'INR' } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized user' });
    if (!eventId || isNaN(eventId) || eventId <= 0)
      return res.status(400).json({ error: 'Invalid event ID' });

    // ✅ Validate event
    const event = await prisma.event.findUnique({ where: { id: Number(eventId) } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // ✅ Prevent duplicate registration
    const existing = await prisma.registration.findFirst({ where: { userId, eventId } });
    if (existing) return res.status(400).json({ error: 'Already registered for this event' });

    const qrPayload = generateQRPayload(userId, eventId);

    let razorpayOrder = null;
    let paymentStatus = 'PAID';
    let paymentId = null;

    // ✅ Create Razorpay order for paid events
    if (paidAmount > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: paidAmount * 100, // in paise
        currency,
        receipt: `receipt_${userId}_${eventId}_${Date.now()}`,
      });
      paymentId = razorpayOrder.id;
      paymentStatus = 'PENDING';
    }

    // ✅ Transaction for registration + QR generation
    const registration = await prisma.$transaction(async (tx) => {
      const created = await tx.registration.create({
        data: {
          userId,
          eventId,
          qrPayload,
          paidAmount,
          currency,
          paymentId,
          paymentStatus,
        },
      });

      const qrImageUrl = await QRCode.toDataURL(qrPayload);

      return await tx.registration.update({
        where: { id: created.id },
        data: { qrImageUrl },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true } },
        },
      });
    });

    return res.status(201).json({
      message: 'Registered successfully',
      registration,
      razorpayOrder,
    });
  } catch (err) {
    console.error('❌ Event registration error:', err);
    return res.status(500).json({
      error: 'Failed to register for event',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * 2️⃣ Check-in (mark attendance via QR scan)
 */
export const checkInEvent = async (req, res) => {
  try {
    const { qrPayload } = req.body;
    if (!qrPayload) return res.status(400).json({ error: 'QR payload is required' });

    const registration = await prisma.registration.findFirst({ where: { qrPayload } });
    if (!registration) return res.status(404).json({ error: 'Invalid QR code' });
    if (registration.attended) return res.status(400).json({ error: 'Already checked in' });

    await prisma.registration.update({
      where: { id: registration.id },
      data: { attended: true },
    });

    return res.json({
      message: 'Attendance marked successfully',
      registrationId: registration.id,
    });
  } catch (err) {
    console.error('❌ Check-in error:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

/**
 * 3️⃣ Organizer — View all registrations for a specific event
 */
export const getRegistrations = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId || isNaN(eventId) || eventId <= 0)
      return res.status(400).json({ error: 'Invalid event ID' });

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      message: 'Registrations fetched successfully',
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    console.error('❌ Fetch registrations error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

/**
 * 4️⃣ Razorpay webhook handler (payment status updates)
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (signature !== expectedSignature)
      return res.status(401).json({ error: 'Invalid webhook signature' });

    const { event, payload } = req.body;
    const paymentId = payload?.payment?.entity?.order_id;

    if (!paymentId) return res.status(400).json({ error: 'Missing payment order ID' });

    if (['payment.captured', 'order.paid'].includes(event)) {
      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'PAID' },
      });
    } else if (event === 'payment.failed') {
      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'FAILED' },
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Razorpay webhook error:', err);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};
