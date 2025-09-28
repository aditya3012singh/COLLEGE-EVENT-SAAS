// // razorpayWebhookController.js
// import crypto from 'crypto';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default razorpayWebhook = async (req, res) => {
//   const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//   const shasum = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');

//   if (shasum === req.headers['x-razorpay-signature']) {
//     const { payload } = req.body;
//     const orderId = payload?.order?.entity?.id;

//     // Mark registration as paid
//     await prisma.registration.updateMany({
//       where: { paymentId: orderId },
//       data: { paymentStatus: 'PAID' }
//     });

//     res.json({ status: 'ok' });
//   } else {
//     res.status(400).json({ error: 'Invalid signature' });
//   }
// };
