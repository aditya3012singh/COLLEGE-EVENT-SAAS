import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "ORGANIZER", "ADMIN"]),
  collegeId: z.number().int().positive(),
});

// User login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// College creation/update validation
export const collegeSchema = z.object({
  name: z.string().min(2, "College name is required"),
  code: z.string().min(2, "College code is required"),
});

// Club creation/update validation
export const clubSchema = z.object({
  name: z.string().min(2, "Club name is required"),
  collegeId: z.number().int().positive(),
});

// Event creation/update validation
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  venue: z.string().min(1, "Venue is required"),
  clubId: z.number().int().positive().optional(),
  visibility: z.enum(["OWN", "SELECTED", "ALL"]),
  allowedColleges: z.array(z.number().int().positive()).optional(),
});

// Registration (event participation) validation - example for payments
export const registrationSchema = z.object({
  eventId: z.number().int().positive(),
  paidAmount: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  paymentGateway: z.enum(["RAZORPAY", "STRIPE"]).optional(),
  paymentId: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
});

// Validation middleware generator
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}
