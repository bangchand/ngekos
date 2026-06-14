import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    kostId: z.string().uuid({ message: 'kostId must be a valid UUID' }),
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().optional(),
    price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
    stock: z.coerce.number().int().nonnegative().optional(),
    facilityIds: z.union([z.string().uuid().transform(val => [val]), z.array(z.string().uuid())]).optional(),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid room ID' }),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    facilityIds: z.union([z.string().uuid().transform(val => [val]), z.array(z.string().uuid())]).optional(),
  }),
});

export const getRoomByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid room ID' }),
  }),
});
