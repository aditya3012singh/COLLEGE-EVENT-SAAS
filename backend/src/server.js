// server.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import router from './routes.js';
import { razorpayWebhook } from './controllers/registrationController.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security + basic middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());

// Rate limiter (tune for your needs)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// IMPORTANT: mount webhook raw body route BEFORE express.json()
// Razorpay webhook expects raw bytes for signature verification.
app.post('/api/registrations/webhook/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);

// Now apply JSON/body parsing for the rest of the API
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount your router (all other routes)
app.use('/api', router);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
