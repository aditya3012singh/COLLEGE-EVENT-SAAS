import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      const paymentStatus = 'PAID';

      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus },
      });
    } else if (event === 'payment.failed') {
      const paymentId = payload.payment.entity.order_id;
      const paymentStatus = 'FAILED';

      await prisma.registration.updateMany({
        where: { paymentId },
        data: { paymentStatus },
      });
    }

    // handle other event types as needed

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};
