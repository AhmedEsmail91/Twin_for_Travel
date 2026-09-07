import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Enter your email address')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Used by `scripts/create-admin.mjs` and any future user management UI. */
export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  name: z.string().trim().min(2, 'Enter a name').max(80),
  password: z
    .string()
    .min(12, 'Use at least 12 characters')
    .max(200, 'That password is too long')
    .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value), {
      message: 'Include upper case, lower case and a number',
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
