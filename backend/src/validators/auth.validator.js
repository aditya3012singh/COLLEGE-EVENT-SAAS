import z from 'zod';

export const authValidators = {
  signup: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  resetPassword: z.object({
    token: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  updateProfile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
  }),
};

export default authValidators;
