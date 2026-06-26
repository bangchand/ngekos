import { Request, Response } from 'express';
import { RoomService } from '@/services/room.service';
import { ApiResponse } from '@/utils/api-response';
import { PrismaQueryBuilder } from 'prisma-query-parser';
import { MediaService } from '@/services/media.service';

import { prisma } from '@/config/database';

export class RoomController {
  public static getRooms = async (req: Request, res: Response): Promise<void> => {
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

    const { data, total } = await RoomService.getRooms(queryOptions);
    const dataWithMedia = await MediaService.attachMedia(data, 'ROOM', imagesSelect, videoSelect);

    ApiResponse.success(res, 'Berhasil mengambil daftar kamar', dataWithMedia, 200, builder.getMeta(total, data.length));
  };

  public static getRoomById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const room = await RoomService.getRoomById(id);
    const roomWithMedia = await MediaService.attachMedia(room, 'ROOM');
    ApiResponse.success(res, 'Berhasil mengambil data kamar', roomWithMedia, 200);
  };

  public static createRoom = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.user!.id;
    const newRoom = await RoomService.createRoom(ownerId, req.body);
    
    // Process uploaded files for media
    await MediaService.processAndSaveMedia(
      req.files as { [fieldname: string]: Express.Multer.File[] },
      newRoom.id,
      'ROOM'
    );

    const roomWithMedia = await MediaService.attachMedia(newRoom, 'ROOM');
    ApiResponse.success(res, 'Berhasil membuat kamar baru', roomWithMedia, 201);
  };

  public static updateRoom = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    const updatedRoom = await RoomService.updateRoom(id, ownerId, req.body);
    
    // Process uploaded files for media
    await MediaService.processAndSaveMedia(
      req.files as { [fieldname: string]: Express.Multer.File[] },
      updatedRoom.id,
      'ROOM'
    );

    const roomWithMedia = await MediaService.attachMedia(updatedRoom, 'ROOM');
    ApiResponse.success(res, 'Berhasil memperbarui data kamar', roomWithMedia, 200);
  };

  public static deleteRoom = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    await RoomService.deleteRoom(id, ownerId);
    ApiResponse.success(res, 'Berhasil menghapus kamar', null, 200);
  };

  public static toggleSaveRoom = async (req: Request, res: Response): Promise<void> => {
    const roomId = req.params.id as string;
    const userId = req.user!.id;
    const result = await RoomService.toggleSaveRoom(userId, roomId);
    ApiResponse.success(res, result.message, { saved: result.saved }, 200);
  };

  public static getSavedRooms = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const builder = new PrismaQueryBuilder(req.query);
    const queryOptions = builder.build();

    const { data, total } = await RoomService.getSavedRooms(userId, queryOptions);
    
    // Attach media to the room inside savedRoom
    const dataWithMedia = await Promise.all(
      data.map(async (savedRoom: any) => {
        savedRoom.room = await MediaService.attachMedia(savedRoom.room, 'ROOM');
        return savedRoom;
      })
    );

    ApiResponse.success(res, 'Berhasil mengambil daftar kamar favorit', dataWithMedia, 200, builder.getMeta(total, data.length));
  };
}
