import { z } from 'zod';

export const createFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required and must be at least 2 characters'),
    type: z.enum(['ROOM_SPEC', 'ROOM_FACILITY', 'BATHROOM_FACILITY', 'PUBLIC_FACILITY', 'PARKING_FACILITY', 'KOST_FACILITY']),
    icon: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
});

export const updateFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    type: z.enum(['ROOM_SPEC', 'ROOM_FACILITY', 'BATHROOM_FACILITY', 'PUBLIC_FACILITY', 'PARKING_FACILITY', 'KOST_FACILITY']).optional(),
    icon: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
});

export const getFacilityByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Facility ID format'),
  }),
});
