import z from 'zod';

export const eventValidators = {
  create: z.object({
    title: z.string().min(3, 'Event title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
    location: z.string().min(3, 'Location is required'),
    maxRegistrations: z.coerce.number().int().positive().optional(),
    collegeId: z.coerce.number().int().positive(),
    clubId: z.coerce.number().int().positive().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).default('DRAFT'),
    image: z.string().url('Invalid image URL').optional(),
  }),

  update: z.object({
    title: z.string().min(3, 'Event title must be at least 3 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    location: z.string().min(3, 'Location is required').optional(),
    maxRegistrations: z.coerce.number().int().positive().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
    image: z.string().url('Invalid image URL').optional(),
  }),

  listQuery: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
    collegeId: z.coerce.number().int().positive().optional(),
  }),

  getById: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export default eventValidators;
