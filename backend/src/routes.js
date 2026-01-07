// routes.js
import express from 'express';
import authRoutes from './routes/auth.route.js';
import bootstrapRoutes from './routes/bootstrap.route.js';
import collegeRoutes from './routes/college.route.js';
import clubRoutes from './routes/club.route.js';
import eventRoutes from './routes/event.route.js';
import registrationRoutes from './routes/registration.route.js';

const router = express.Router();

// ===== Bootstrap Route (Must be before auth routes) =====
// Creates first admin and college - only works if no colleges exist
router.use('/bootstrap', bootstrapRoutes);

// ===== Auth Routes =====
router.use('/auth', authRoutes);

// ===== College Routes =====
router.use('/colleges', collegeRoutes);

// ===== Club Routes =====
router.use('/clubs', clubRoutes);

// ===== Event Routes =====
router.use('/events', eventRoutes);

// ===== Registration Routes =====
router.use('/registrations', registrationRoutes);

export default router;
