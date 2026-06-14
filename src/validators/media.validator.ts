import { z } from 'zod';

export const createMediaSchema = z.object({
  body: z.object({
    entityId: z.string().uuid({ message: 'entityId must be a valid UUID' }),
    entityType: z.enum(['KOST', 'ROOM', 'FACILITY', 'USER']),
    type: z.enum(['PHOTO', 'VIDEO']).optional().default('PHOTO'),
  }),
});

export const deleteMediaSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid media ID' }),
  }),
});
