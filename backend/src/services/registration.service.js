import prisma from '../utils/prisma.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getEnv } from '../utils/env.js';
import { z } from 'zod';

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

/* ---------- Validation Schemas ---------- */
const registerSchema = z.object({
  eventId: z.union([z.string(), z.number()]).transform(Number),
  currency: z.string().optional().default('INR'),
});

const checkinSchema = z.object({
  qrToken: z.string().min(10),
});

/* ---------- Helpers ---------- */
function createSignedQRToken(userId, eventId, ttlSeconds = 60 * 60) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = `${userId}:${eventId}:${expiresAt}:${crypto.randomBytes(6).toString('hex')}`;
  const sig = crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${sig}`).toString('base64url');
  return { token, expiresAt };
}

export function verifySignedQRToken(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length < 5) return null;
    const sig = parts.pop();
    const rand = parts.pop();
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

/* ---------- Register For Event Service ---------- */
export const registerForEventService = async (data, userId) => {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid input', issues: parsed.error.format() };
  }

  const { eventId } = parsed.data;

  // Validate event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, isPaid: true, price: true, currency: true },
  });

  if (!event) {
    throw { status: 404, message: 'Event not found' };
  }

  // Prevent duplicate registration
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing) {
    throw {
      status: 409,
      message: 'Already registered for this event',
      registration: existing,
    };
  }

  const amountToPay = event.isPaid ? (event.price ?? 0) : 0;
  const currency = event.currency ?? parsed.data.currency;

  const registration = await prisma.$transaction(async (tx) => {
    // Create registration record
    const reg = await tx.registration.create({
      data: {
        userId,
        eventId,
        qrPayload: null,
        qrImageUrl: null,
        paidAmount: amountToPay > 0 ? amountToPay : null,
        currency: amountToPay > 0 ? currency : null,
        paymentGateway: amountToPay > 0 ? 'RAZORPAY' : null,
        paymentId: null,
        paymentStatus: amountToPay > 0 ? 'PENDING' : 'PAID',
      },
      select: { id: true },
    });

    let razorpayOrder = null;
    if (amountToPay > 0) {
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: amountToPay,
          currency,
          receipt: `reg_${userId}_${eventId}_${reg.id}`,
        });
        await tx.registration.update({
          where: { id: reg.id },
          data: { paymentId: razorpayOrder.id },
        });
      } catch (rpErr) {
        console.error('Razorpay order creation failed', rpErr);
        throw Object.assign(new Error('Payment provider error'), { status: 502 });
      }
    }

    // Generate QR token and image
    const { token, expiresAt } = createSignedQRToken(userId, eventId, 60 * 60 * 6);
    const qrDataUrl = await QRCode.toDataURL(token);

    // Update registration with QR info
    const updated = await tx.registration.update({
      where: { id: reg.id },
      data: {
        qrPayload: token,
        qrImageUrl: qrDataUrl,
        scannedAt: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });

    return { registration: updated, razorpayOrder };
  });

  return registration;
};

/* ---------- Check-In Event Service ---------- */
export const checkInEventService = async (data, userId, userRole) => {
  const parsed = checkinSchema.safeParse(data);
  if (!parsed.success) {
    throw { status: 400, message: 'Invalid payload', issues: parsed.error.format() };
  }

  if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    throw { status: 403, message: 'Forbidden: only organizers/admins can scan' };
  }

  const { qrToken } = parsed.data;

  // Validate and parse token
  const parsedToken = verifySignedQRToken(qrToken);
  if (!parsedToken) {
    throw { status: 400, message: 'Invalid or expired QR token' };
  }

  // Find matching registration by token
  const registration = await prisma.registration.findFirst({
    where: { qrPayload: qrToken },
  });

  if (!registration) {
    throw { status: 404, message: 'Registration not found' };
  }

  // Race-safe update
  const updateResult = await prisma.registration.updateMany({
    where: { id: registration.id, attended: false },
    data: { attended: true, scannedAt: new Date(), scannedBy: userId },
  });

  if (updateResult.count === 0) {
    throw { status: 409, message: 'Already checked in (or concurrent check-in)' };
  }

  return { registrationId: registration.id };
};

/* ---------- Get Registrations For Event Service ---------- */
export const getRegistrationsService = async (eventId) => {
  const id = Number(eventId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw { status: 400, message: 'Invalid event ID' };
  }

  const regs = await prisma.registration.findMany({
    where: { eventId: id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return regs;
};

/* ---------- Get My Registrations Service ---------- */
export const getMyRegistrationsService = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          college: { select: { id: true, name: true, code: true } },
          club: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return registrations;
};

/* ---------- Handle Razorpay Webhook Service ---------- */
export const handleRazorpayWebhookService = async (bodyBuffer, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw { status: 500, message: 'Webhook secret not configured' };
  }

  const computed = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');

  if (!signature || !crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
    throw { status: 401, message: 'Invalid webhook signature' };
  }

  const payload = JSON.parse(bodyBuffer.toString('utf8'));
  const event = payload.event;
  const orderId = payload?.payload?.order?.entity?.id || payload?.payload?.payment?.entity?.order_id;

  if (!orderId) {
    throw { status: 400, message: 'Missing order id in payload' };
  }

  if (event === 'payment.captured' || event === 'order.paid' || event === 'payment.authorized') {
    await prisma.registration.updateMany({
      where: { paymentId: orderId },
      data: { paymentStatus: 'PAID' },
    });
  } else if (event === 'payment.failed') {
    await prisma.registration.updateMany({
      where: { paymentId: orderId },
      data: { paymentStatus: 'FAILED' },
    });
  }

  return { status: 'ok' };
};
