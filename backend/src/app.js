// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import collegeRoutes from './routes/college.js';
import clubRoutes from './routes/club.js';
import eventRoutes from './routes/event.js';
// import registrationRoutes from './routes/registration.js';
// import razorpayWebhookRoutes from './utils/paymentWebhooks.js'; // if you use webhook

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
// app.use('/api/registrations', registrationRoutes);

// Razorpay webhook (requires raw body parser)
// app.use(
//   '/api/webhook/razorpay',
//   express.json({ type: '*/*' }),
//   razorpayWebhookRoutes
// );

export default app;
