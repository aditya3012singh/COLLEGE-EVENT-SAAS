import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Utility to generate signed QR payload
const generateQRPayload = (userId, eventId) => {
  const payload = `${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
};

// 1️⃣ Register student for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, paidAmount = 0, currency = 'INR' } = req.body;
    const userId = req.user.id;

    const existing = await prisma.registration.findFirst({ where: { userId, eventId } });
    if (existing) return res.status(400).json({ error: 'Already registered' });

    const qrPayload = generateQRPayload(userId, eventId);

    let paymentId = null;
    let paymentStatus = 'PAID';

    let razorpayOrder = null;
    if (paidAmount > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: paidAmount * 100,
        currency,
        receipt: `receipt_${userId}_${eventId}`,
      });
      paymentId = razorpayOrder.id;
      paymentStatus = 'PENDING';
    }

    const registration = await prisma.$transaction(async (prisma) => {
      const reg = await prisma.registration.create({
        data: { userId, eventId, qrPayload, paidAmount, currency, paymentId, paymentStatus },
      });
      const qrImageUrl = await QRCode.toDataURL(qrPayload);
      await prisma.registration.update({ where: { id: reg.id }, data: { qrImageUrl } });
      return { ...reg, qrImageUrl };
    });

    res.status(201).json({
      message: 'Registered successfully',
      registration,
      razorpayOrder,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// 2️⃣ Organizer scans QR → mark attendance
export const checkInEvent = async (req, res) => {
  try {
    const { qrPayload } = req.body;

    const registration = await prisma.registration.findFirst({ where: { qrPayload } });

    if (!registration) return res.status(400).json({ error: 'Invalid QR code' });
    if (registration.attended) return res.status(400).json({ error: 'Already checked in' });

    await prisma.registration.update({ where: { id: registration.id }, data: { attended: true } });
    res.json({ message: 'Attendance marked', registrationId: registration.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// 3️⃣ Organizer views all registrations for an event
export const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await prisma.registration.findMany({
      where: { eventId: parseInt(eventId) },
      include: { user: true },
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// 4️⃣ Razorpay payment webhook handler
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    const body = JSON.stringify(req.body);
    shasum.update(body);
    const digest = shasum.digest('hex');

    const signature = req.headers['x-razorpay-signature'];
    if (signature !== digest) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentId = payload.payment.entity.order_id;
      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'PAID' },
      });
    } else if (event === 'payment.failed') {
      const paymentId = payload.payment.entity.order_id;
      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'FAILED' },
      });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};
