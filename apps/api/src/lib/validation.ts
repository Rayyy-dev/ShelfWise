import { z } from 'zod';

// Book schemas
export const createBookSchema = z.object({
  isbn: z.string().max(20).optional().nullable(),
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().min(1, 'Author is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(2000).optional().nullable(),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  copies: z.array(z.string().min(1).max(50)).optional(),
});

export const updateBookSchema = createBookSchema.partial();

// Member schemas
export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  maxBooks: z.number().int().min(1).max(50).optional(),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED']).optional(),
});

// Borrowing schemas
export const checkoutSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  barcode: z.string().min(1, 'Barcode is required').max(50),
  dueDate: z.string().datetime().optional(),
});

export const updateBorrowingSchema = z.object({
  dueDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'RETURNED']).optional(),
});

// Fine schemas
export const createFineSchema = z.object({
  borrowingId: z.string().min(1, 'Borrowing ID is required'),
  amount: z.number().positive('Amount must be positive').max(1000),
  reason: z.enum(['OVERDUE', 'DAMAGE', 'LOST']),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Validation middleware helper
export function validate<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: true, data: result.data };
  };
}
