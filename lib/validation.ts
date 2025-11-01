import { z } from 'zod';

// Email validation schema with preprocessing
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .trim()
  .email('Please enter a valid email address')
  .transform((val) => val.toLowerCase());

// Password validation schema
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password must be less than 128 characters');

// Signup validation schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Helper function to validate email (for client-side validation)
export function isValidEmail(email: string): boolean {
  try {
    // Trim and validate format (don't transform to lowercase for validation check)
    z.string()
      .min(1, 'Email is required')
      .trim()
      .email('Please enter a valid email address')
      .parse(email.trim());
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate and format email
export function validateAndFormatEmail(email: string): string {
  return emailSchema.parse(email);
}
