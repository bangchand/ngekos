import { z } from 'zod';

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format. Must be a valid UUID.'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format. Must be a valid UUID.'),
  }),
  body: z
    .object({
      email: z
        .string()
        .email('Invalid email address')
        .trim()
        .lowercase()
        .optional(),
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .optional(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be updated',
    }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format. Must be a valid UUID.'),
  }),
});
