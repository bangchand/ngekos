import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { Facility } from '@prisma/client';

export class FacilityService {
  /**
   * Retrieves all facilities using query options from PrismaQueryBuilder
   */
  public static async getFacilities(queryOptions: any = {}): Promise<{ data: Facility[], total: number }> {
    const data = await prisma.facility.findMany(queryOptions);
    const total = await prisma.facility.count({ where: queryOptions.where });
    return { data, total };
  }

  /**
   * Retrieves a single facility by ID
   */
  public static async getFacilityById(id: string): Promise<Facility> {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        rooms: {
          select: { id: true, name: true }
        }
      }
    });

    if (!facility) {
      throw new AppError('Fasilitas tidak ditemukan', 404);
    }

    return facility;
  }

  /**
   * Creates a new facility
   */
  public static async createFacility(input: any): Promise<Facility> {
    // Ensure facility name is unique
    const existing = await prisma.facility.findUnique({ where: { name: input.name } });
    if (existing) {
      throw new AppError('Fasilitas dengan nama ini sudah ada', 400);
    }

    return prisma.facility.create({
      data: input,
    });
  }

  /**
   * Updates an existing facility
   */
  public static async updateFacility(id: string, input: any): Promise<Facility> {
    const facility = await prisma.facility.findUnique({ where: { id } });

    if (!facility) {
      throw new AppError('Fasilitas tidak ditemukan', 404);
    }

    if (input.name && input.name !== facility.name) {
      const existing = await prisma.facility.findUnique({ where: { name: input.name } });
      if (existing) {
        throw new AppError('Fasilitas dengan nama ini sudah ada', 400);
      }
    }

    return prisma.facility.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Deletes a facility
   */
  public static async deleteFacility(id: string): Promise<void> {
    const facility = await prisma.facility.findUnique({ where: { id } });

    if (!facility) {
      throw new AppError('Fasilitas tidak ditemukan', 404);
    }

    await prisma.facility.delete({
      where: { id },
    });
  }
}
