import { prisma } from '@/config/database';
import { EntityType, MediaType } from '@prisma/client';

export class MediaService {
  /**
   * Memproses file yang di-upload dari req.files dan menyimpannya ke tabel Media
   * 
   * @param files Obyek file dari req.files (hasil dari multer)
   * @param entityId UUID dari entitas yang bersangkutan (Kost, Room, dll)
   * @param entityType Tipe entitas (KOST, ROOM, dll)
   */
  public static async processAndSaveMedia(
    files: { [fieldname: string]: Express.Multer.File[] } | undefined | Express.Multer.File[],
    entityId: string,
    entityType: EntityType
  ): Promise<void> {
    if (!files || Array.isArray(files)) return;

    const mediaData: { url: string; entityId: string; entityType: EntityType; type: MediaType }[] = [];

    if (files.images) {
      files.images.forEach((file) => {
        mediaData.push({
          url: `/public/uploads/${entityType}/${file.filename}`,
          entityId,
          entityType,
          type: 'PHOTO',
        });
      });
    }

    if (files.video) {
      files.video.forEach((file) => {
        mediaData.push({
          url: `/public/uploads/${entityType}/${file.filename}`,
          entityId,
          entityType,
          type: 'VIDEO',
        });
      });
    }

    if (mediaData.length > 0) {
      await prisma.media.createMany({ data: mediaData });
    }
  }

  /**
   * Mengambil dan melampirkan media ke dalam hasil query.
   * Karena menggunakan True Polymorphism, kita melampirkannya secara manual.
   */
  public static async attachMedia(
    data: any | any[], 
    entityType: EntityType,
    imagesSelect?: any,
    videoSelect?: any
  ): Promise<any> {
    if (!data) return data;
    const isArray = Array.isArray(data);
    const entities = isArray ? data : [data];
    if (entities.length === 0) return data;

    const entityIds = entities.map((e: any) => e.id);

    const medias = await prisma.media.findMany({
      where: {
        entityId: { in: entityIds },
        entityType: entityType,
      },
    });

    const mediaMap = new Map<string, any[]>();
    medias.forEach((media) => {
      if (!mediaMap.has(media.entityId)) {
        mediaMap.set(media.entityId, []);
      }
      mediaMap.get(media.entityId)!.push(media);
    });

    // Helper untuk memfilter properti objek sesuai query param (contoh: select: { url: true })
    const filterObject = (obj: any, selectObj: any) => {
      if (!selectObj) return obj;
      const result: any = {};
      for (const key of Object.keys(selectObj)) {
        if (selectObj[key] === true && obj[key] !== undefined) {
          result[key] = obj[key];
        }
      }
      return result;
    };

    entities.forEach((entity: any) => {
      const entityMedias = mediaMap.get(entity.id) || [];
      
      const images = entityMedias.filter((m) => m.type === 'PHOTO');
      entity.images = imagesSelect 
        ? images.map(img => filterObject(img, imagesSelect)) 
        : images;

      const video = entityMedias.find((m) => m.type === 'VIDEO') || null;
      entity.video = (video && videoSelect) 
        ? filterObject(video, videoSelect) 
        : video;
    });

    return isArray ? entities : entities[0];
  }
}
