import { Request, Response } from 'express';
import { KostService } from '@/services/kost.service';
import { ApiResponse } from '@/utils/api-response';
import { PrismaQueryBuilder } from 'prisma-query-parser';
import { MediaService } from '@/services/media.service';

export class KostController {
  /**
   * Get all Kosts
   */
  public static getKosts = async (req: Request, res: Response): Promise<void> => {
    const builder = new PrismaQueryBuilder(req.query);
    const queryOptions = builder.build();

    const { data, total } = await KostService.getKosts(queryOptions);

    ApiResponse.success(res, 'Berhasil mengambil daftar kost', data, 200, builder.getMeta(total, data.length));
  };

  /**
   * Get a single Kost by ID
   */
  public static getKostById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const kost = await KostService.getKostById(id);
    ApiResponse.success(res, 'Berhasil mengambil data kost', kost, 200);
  };

  /**
   * Create a new Kost
   */
  public static createKost = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.user!.id;

    const newKost = await KostService.createKost(ownerId, req.body);
    ApiResponse.success(res, 'Berhasil membuat kost baru', newKost, 201);
  };

  /**
   * Update an existing Kost
   */
  public static updateKost = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;

    const updatedKost = await KostService.updateKost(id, ownerId, req.body);
    ApiResponse.success(res, 'Berhasil memperbarui data kost', updatedKost, 200);
  };

  /**
   * Delete a Kost
   */
  public static deleteKost = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    const userRole = req.user!.role;
    
    await KostService.deleteKost(id, ownerId, userRole);
    ApiResponse.success(res, 'Berhasil menghapus kost', null, 200);
  };
}
