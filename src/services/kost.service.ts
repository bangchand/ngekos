import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { CreateKostInput, UpdateKostInput } from '@/types/kost.type';
import { Kost } from '@prisma/client';

export class KostService {
  /**
   * Retrieves all kosts
   */
  public static async getKosts(): Promise<Kost[]> {
    return prisma.kost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Retrieves a single kost by ID
   */
  public static async getKostById(id: string): Promise<Kost> {
    const kost = await prisma.kost.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!kost) {
      throw new AppError('Kost not found', 404);
    }

    return kost;
  }

  /**
   * Creates a new kost
   */
  public static async createKost(ownerId: string, input: CreateKostInput): Promise<Kost> {
    return prisma.kost.create({
      data: {
        ...input,
        ownerId,
      },
    });
  }

  /**
   * Updates an existing kost
   */
  public static async updateKost(id: string, ownerId: string, input: UpdateKostInput): Promise<Kost> {
    const kost = await prisma.kost.findUnique({ where: { id } });

    if (!kost) {
      throw new AppError('Kost not found', 404);
    }

    // Ensure only the owner can update their kost
    if (kost.ownerId !== ownerId) {
      throw new AppError('You do not have permission to update this kost', 403);
    }

    return prisma.kost.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Deletes a kost
   */
  public static async deleteKost(id: string, ownerId: string, userRole: string): Promise<void> {
    const kost = await prisma.kost.findUnique({ where: { id } });

    if (!kost) {
      throw new AppError('Kost not found', 404);
    }

    // Ensure only the owner or an admin can delete the kost
    if (kost.ownerId !== ownerId && userRole !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this kost', 403);
    }

    await prisma.kost.delete({
      where: { id },
    });
  }
}
