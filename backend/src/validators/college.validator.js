import z from 'zod';

export const collegeValidators = {
  create: z.object({
    name: z.string().min(3, 'College name must be at least 3 characters'),
    email: z.string().email('Invalid college email'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    logo: z.string().url('Invalid logo URL').optional(),
  }),

  update: z.object({
    name: z.string().min(3, 'College name must be at least 3 characters').optional(),
    email: z.string().email('Invalid college email').optional(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    city: z.string().min(2, 'City is required').optional(),
    state: z.string().min(2, 'State is required').optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
    logo: z.string().url('Invalid logo URL').optional(),
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

export default collegeValidators;
