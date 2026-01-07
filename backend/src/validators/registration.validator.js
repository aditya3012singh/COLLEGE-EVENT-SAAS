import z from 'zod';

export const registrationValidators = {
  create: z.object({
    eventId: z.coerce.number().int().positive(),
    userId: z.coerce.number().int().positive(),
    registrationData: z.record(z.any()).optional(),
  }),

  updateStatus: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED']),
  }),

  listQuery: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED']).optional(),
    eventId: z.coerce.number().int().positive().optional(),
    userId: z.coerce.number().int().positive().optional(),
  }),

  getById: z.object({
    id: z.coerce.number().int().positive(),
  }),

  cancelRegistration: z.object({
    reason: z.string().optional(),
  }),

  checkIn: z.object({
    token: z.string().optional(),
  }),
};

export default registrationValidators;
