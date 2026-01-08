// server.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import router from './routes.js';
import { validateEnv, getEnvConfig } from './utils/env.js';
import { logger } from './utils/logger.js';
import { globalErrorHandler } from './utils/errorHandler.js';
import requestLoggingMiddleware from './middleware/requestLoggingMiddleware.js';
import { swaggerSpec } from './config/swagger.js';

// Validate environment first
validateEnv();

const app = express();
const config = getEnvConfig();

// Security + basic middleware
app.use(helmet());
app.use(cors({ 
  origin: config.frontendOrigin || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());

// Request logging middleware
app.use(requestLoggingMiddleware);

// Rate limiter (tune for your needs)
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// IMPORTANT: mount webhook raw body route BEFORE express.json()
// Razorpay webhook expects raw bytes for signature verification.
app.post('/api/registrations/webhook/razorpay', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Preserve raw body for webhook verification
  next();
});

// Now apply JSON/body parsing for the rest of the API
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount your router (all other routes)
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
  });
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

app.listen(config.port, () => {
  logger.info(`Server started`, {
    port: config.port,
    nodeEnv: config.nodeEnv,
    frontendOrigin: config.frontendOrigin,
  });
  console.log(`✅ Server running on port ${config.port}`);
});
