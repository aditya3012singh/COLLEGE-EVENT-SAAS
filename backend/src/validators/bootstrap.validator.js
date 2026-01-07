import z from 'zod';

export const bootstrapValidators = {
  createAdminUser: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),

  createCollege: z.object({
    name: z.string().min(3, 'College name must be at least 3 characters'),
    email: z.string().email('Invalid college email'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  }),
};

export default bootstrapValidators;
