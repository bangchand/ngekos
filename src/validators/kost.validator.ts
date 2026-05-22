import { z } from 'zod';

export const createKostSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    type: z.enum(['MALE', 'FEMALE', 'MIXED']),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    province: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    thumbnail: z.string().url().optional(),
  }),
});

export const updateKostSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    type: z.enum(['MALE', 'FEMALE', 'MIXED']).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    province: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    thumbnail: z.string().url().optional(),
  }),
});

export const getKostByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Kost ID format'),
  }),
});
