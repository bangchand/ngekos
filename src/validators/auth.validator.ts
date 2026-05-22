import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email address')
      .trim()
      .lowercase(),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .optional()
      .or(z.literal('')),
    role: z
      .enum(['USER', 'ADMIN', 'OWNER'])
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email address')
      .trim()
      .lowercase(),
    password: z
      .string({ message: 'Password is required' }),
  }),
});
