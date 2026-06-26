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

    let imagesSelect: any = undefined;
    let videoSelect: any = undefined;

    // Hapus virtual fields dari Prisma query (karena tidak ada di schema)
    if (queryOptions.select) {
      if (queryOptions.select.images && queryOptions.select.images.select) {
        imagesSelect = queryOptions.select.images.select;
      }
      delete queryOptions.select.images;

      if (queryOptions.select.video && queryOptions.select.video.select) {
        videoSelect = queryOptions.select.video.select;
      }
      delete queryOptions.select.video;

      if (Object.keys(queryOptions.select).length === 0) delete queryOptions.select;
    }
    if (queryOptions.include) {
      delete queryOptions.include.images;
      delete queryOptions.include.video;
      if (Object.keys(queryOptions.include).length === 0) delete queryOptions.include;
    }

    const { data, total } = await KostService.getKosts(queryOptions);
    const dataWithMedia = await MediaService.attachMedia(data, 'KOST', imagesSelect, videoSelect);

    ApiResponse.success(res, 'Berhasil mengambil daftar kost', dataWithMedia, 200, builder.getMeta(total, data.length));
  };

  /**
   * Get a single Kost by ID
   */
  public static getKostById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const kost = await KostService.getKostById(id);
    const kostWithMedia = await MediaService.attachMedia(kost, 'KOST');
    ApiResponse.success(res, 'Berhasil mengambil data kost', kostWithMedia, 200);
  };

  /**
   * Create a new Kost
   */
  public static createKost = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.user!.id;

    const newKost = await KostService.createKost(ownerId, req.body);
    
    // Process uploaded files for media
    await MediaService.processAndSaveMedia(
      req.files as { [fieldname: string]: Express.Multer.File[] },
      newKost.id,
      'KOST'
    );

    const kostWithMedia = await MediaService.attachMedia(newKost, 'KOST');
    ApiResponse.success(res, 'Berhasil membuat kost baru', kostWithMedia, 201);
  };

  /**
   * Update an existing Kost
   */
  public static updateKost = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;

    const updatedKost = await KostService.updateKost(id, ownerId, req.body);
    
    // Process uploaded files for media
    await MediaService.processAndSaveMedia(
      req.files as { [fieldname: string]: Express.Multer.File[] },
      updatedKost.id,
      'KOST'
    );

    const kostWithMedia = await MediaService.attachMedia(updatedKost, 'KOST');
    ApiResponse.success(res, 'Berhasil memperbarui data kost', kostWithMedia, 200);
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
