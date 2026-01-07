import z from 'zod';

export const clubValidators = {
  create: z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    collegeId: z.coerce.number().int().positive(),
    logo: z.string().url('Invalid logo URL').optional(),
  }),

  update: z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    logo: z.string().url('Invalid logo URL').optional(),
  }),

  addMember: z.object({
    userId: z.coerce.number().int().positive(),
    role: z.enum(['MEMBER', 'COORDINATOR', 'ADMIN']),
  }),

  updateMember: z.object({
    role: z.enum(['MEMBER', 'COORDINATOR', 'ADMIN']),
  }),

  removeMember: z.object({
    userId: z.coerce.number().int().positive(),
  }),

  listQuery: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
  }),

  getById: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export default clubValidators;
