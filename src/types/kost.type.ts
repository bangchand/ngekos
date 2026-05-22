import { Kost } from '@prisma/client';

export type CreateKostInput = Omit<Kost, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'ownerId'>;
export type UpdateKostInput = Partial<CreateKostInput>;
