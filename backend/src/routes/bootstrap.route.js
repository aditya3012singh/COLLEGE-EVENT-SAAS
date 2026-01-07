import express from 'express';
import { bootstrapController } from '../controllers/bootstrap.controller.js';

const router = express.Router();

/**
 * POST /bootstrap
 * Creates first admin and college - only works if no colleges exist
 */
router.post('/', bootstrapController);

export default router;
