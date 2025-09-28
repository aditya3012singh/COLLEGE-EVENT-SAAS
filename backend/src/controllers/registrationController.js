// registrationController.js
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Setup Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Utility to generate signed QR token
const generateQRPayload = (userId, eventId) => {
  const payload = `${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
};

// 1️⃣ Register student for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, paidAmount = 0, currency = 'INR' } = req.body;
    const userId = req.user.id;

    // Check if already registered
    const existing = await prisma.registration.findFirst({ where: { userId, eventId } });
    if (existing) return res.status(400).json({ error: 'Already registered' });

    // Generate QR payload
    const qrPayload = generateQRPayload(userId, eventId);

    // If payment required
    let paymentId = null;
    let paymentStatus = 'PENDING';
    if (paidAmount > 0) {
      const order = await razorpay.orders.create({
        amount: paidAmount * 100, // in paise
        currency,
        receipt: `receipt_${userId}_${eventId}`,
      });
      paymentId = order.id;
    } else {
      paymentStatus = 'PAID';
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: { userId, eventId, qrPayload, paidAmount, currency, paymentId, paymentStatus }
    });

    // Generate QR image URL (data URI)
    const qrImageUrl = await QRCode.toDataURL(qrPayload);
    await prisma.registration.update({ where: { id: registration.id }, data: { qrImageUrl } });

    res.json({ message: 'Registered successfully', registration, qrImageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Organizer views all registrations for an event
export const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: { user: true }
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
