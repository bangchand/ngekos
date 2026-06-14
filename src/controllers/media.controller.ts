import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { ApiResponse } from '@/utils/api-response';
import { AppError } from '@/utils/app-error';

export class MediaController {
  /**
   * Upload and create new media
   */
  public static createMedia = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('File tidak ditemukan. Silakan upload file.', 400);
    }

    const { entityId, entityType, type } = req.body;
    
    // Fixed relative path dari backend
    const url = `/public/uploads/${entityType.toUpperCase()}/${req.file.filename}`;

    const newMedia = await prisma.media.create({
      data: {
        url,
        entityId,
        entityType,
        type: type || 'PHOTO',
      },
    });

    ApiResponse.success(res, 'Berhasil mengunggah media', newMedia, 201);
  };

  /**
   * Delete media
   */
  public static deleteMedia = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const existingMedia = await prisma.media.findUnique({ where: { id } });
    if (!existingMedia) {
      throw new AppError('Media tidak ditemukan', 404);
    }

    // Menghapus file fisik dari direktori storage
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), existingMedia.url);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Gagal menghapus file fisik:', error);
    }
    
    await prisma.media.delete({ where: { id } });

    ApiResponse.success(res, 'Berhasil menghapus media', null, 200);
  };
}
