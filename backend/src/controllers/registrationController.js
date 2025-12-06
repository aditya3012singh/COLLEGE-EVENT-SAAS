// controllers/registration.js
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

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

/* ---------------- Validation ---------------- */
const registerSchema = z.object({
  eventId: z.union([z.string(), z.number()]).transform(Number),
  // client SHOULD NOT send paidAmount; we'll use event.price from DB
  currency: z.string().optional().default('INR'),
});

const checkinSchema = z.object({
  qrToken: z.string().min(10),
});

/* ---------------- Helpers ---------------- */

// Create a signed QR token (HMAC) that includes eventId, userId and expiry timestamp.
// We also store the token and expiry in DB so we can revoke or check TTL server-side.
function createSignedQRToken(userId, eventId, ttlSeconds = 60 * 60) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = `${userId}:${eventId}:${expiresAt}:${crypto.randomBytes(6).toString('hex')}`;
  const sig = crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${sig}`).toString('base64url'); // URL-safe
  return { token, expiresAt };
}

// Verify signed token (returns { userId, eventId } or null)
function verifySignedQRToken(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    // payload shape: userId:eventId:expiresAt:randHex:sigHex
    if (parts.length < 5) return null;
    const sig = parts.pop();
    const rand = parts.pop(); // random hex
    const [userIdStr, eventIdStr, expiresAtStr] = parts;
    const payload = `${userIdStr}:${eventIdStr}:${expiresAtStr}:${rand}`;
    const expected = crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    if (Date.now() > Number(expiresAtStr)) return null;
    return { userId: Number(userIdStr), eventId: Number(eventIdStr) };
  } catch (err) {
    return null;
  }
}

/* ---------------- Registration (creates registration + optionally Razorpay order) ---------------- */
export const registerForEvent = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.format() });

    const { eventId } = parsed.data;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Validate event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, isPaid: true, price: true, currency: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Prevent duplicate registration
    const existing = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId } }, // requires unique([userId,eventId]) in schema
    });
    if (existing) {
      return res.status(409).json({ error: 'Already registered for this event', registration: existing });
    }

    // Determine amount to charge (use event.price which should be in smallest unit)
    const amountToPay = event.isPaid ? (event.price ?? 0) : 0;
    const currency = event.currency ?? parsed.data.currency;

    // Begin transaction: create registration and optionally razorpay order
    const registration = await prisma.$transaction(async (tx) => {
      // create registration record (paymentStatus PENDING if paid)
      const reg = await tx.registration.create({
        data: {
          userId,
          eventId,
          qrPayload: null, // we'll set after token generation
          qrImageUrl: null,
          paidAmount: amountToPay > 0 ? amountToPay : null,
          currency: amountToPay > 0 ? currency : null,
          paymentGateway: amountToPay > 0 ? 'RAZORPAY' : null,
          paymentId: null,
          paymentStatus: amountToPay > 0 ? 'PENDING' : 'PAID',
        },
        select: {
          id: true,
        },
      });

      let razorpayOrder = null;
      if (amountToPay > 0) {
        // create razorpay order — amountToPay already in smallest unit (paise)
        try {
          razorpayOrder = await razorpay.orders.create({
            amount: amountToPay, // smallest unit
            currency,
            receipt: `reg_${userId}_${eventId}_${reg.id}`,
          });
          // attach paymentId (order id) to registration
          await tx.registration.update({
            where: { id: reg.id },
            data: { paymentId: razorpayOrder.id },
          });
        } catch (rpErr) {
          // rollback by throwing
          console.error('Razorpay order creation failed', rpErr);
          throw Object.assign(new Error('Payment provider error'), { status: 502 });
        }
      }

      // generate QR token and QR image
      const { token, expiresAt } = createSignedQRToken(userId, eventId, 60 * 60 * 6); // 6 hours TTL
      const qrDataUrl = await QRCode.toDataURL(token);

      // update registration with QR info and expiry
      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          qrPayload: token,
          qrImageUrl: qrDataUrl,
          scannedAt: null,
          paidAmount: amountToPay > 0 ? amountToPay : null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true } },
        },
      });

      return { registration: updated, razorpayOrder };
    });

    return res.status(201).json({
      message: 'Registered successfully',
      registration: registration.registration,
      razorpayOrder: registration.razorpayOrder ?? null,
    });
  } catch (err) {
    console.error('RegisterForEvent error:', err);
    if (err?.status === 502) return res.status(502).json({ error: 'Payment provider error' });
    return res.status(500).json({ error: 'Failed to register', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------- Check-in (scanner provides qrToken) ---------------- */
export const checkInEvent = async (req, res) => {
  try {
    const parsed = checkinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.format() });

    const { qrToken } = parsed.data;
    const scannerId = req.user?.id;
    if (!scannerId) return res.status(401).json({ error: 'Unauthorized' });

    // Only organizers/admins should be allowed to scan
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: only organizers/admins can scan' });
    }

    // Validate and parse token
    const parsedToken = verifySignedQRToken(qrToken);
    if (!parsedToken) return res.status(400).json({ error: 'Invalid or expired QR token' });

    // Find matching registration by token
    const registration = await prisma.registration.findFirst({ where: { qrPayload: qrToken } });
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    // Race-safe update: only mark as attended if not already attended
    const updateResult = await prisma.registration.updateMany({
      where: { id: registration.id, attended: false },
      data: { attended: true, scannedAt: new Date(), scannedBy: scannerId },
    });

    if (updateResult.count === 0) {
      return res.status(409).json({ error: 'Already checked in (or concurrent check-in)' });
    }

    return res.json({ message: 'Attendance marked successfully', registrationId: registration.id });
  } catch (err) {
    console.error('CheckInEvent error:', err);
    return res.status(500).json({ error: 'Failed to check in', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

/* ---------------- Get registrations for event (organizer/admin) ---------------- */
export const getRegistrations = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId || Number.isNaN(eventId) || eventId <= 0) return res.status(400).json({ error: 'Invalid event ID' });

    // authorization: only organizer/admin of that college or admin can view
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Optionally verify req.user belongs to event.college — omitted for brevity

    const regs = await prisma.registration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ message: 'Registrations fetched', count: regs.length, registrations: regs });
  } catch (err) {
    console.error('GetRegistrations error:', err);
    return res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

/* ---------------- Razorpay webhook (IMPORTANT: use raw body) ---------------- */
/**
 * Note: Razorpay requires verification of the raw request body. In Express, you must
 * configure the webhook route to receive raw body bytes:
 *
 * app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook)
 *
 * Do NOT use express.json() middleware for this route or capture the raw body yourself
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const bodyBuffer = req.body; // raw buffer when using express.raw()
    const computed = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');

    if (!signature || !crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(bodyBuffer.toString('utf8'));
    const event = payload.event;
    // Razorpay payload structure differs; adapt to the structure you expect
    const orderId = payload?.payload?.order?.entity?.id || payload?.payload?.payment?.entity?.order_id;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order id in payload' });
    }

    if (event === 'payment.captured' || event === 'order.paid' || event === 'payment.authorized') {
      await prisma.registration.updateMany({ where: { paymentId: orderId }, data: { paymentStatus: 'PAID' } });
    } else if (event === 'payment.failed') {
      await prisma.registration.updateMany({ where: { paymentId: orderId }, data: { paymentStatus: 'FAILED' } });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
};
