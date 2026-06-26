import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';

export class RoomService {
  public static createRoom = async (ownerId: string, data: any) => {
    // Verify Kost belongs to owner (if not ADMIN)
    const kost = await prisma.kost.findUnique({ where: { id: data.kostId } });
    if (!kost) {
      throw new AppError('Kost tidak ditemukan', 404);
    }
    // Check ownership
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (user?.role !== 'ADMIN' && kost.ownerId !== ownerId) {
      throw new AppError('Kamu tidak memiliki izin untuk menambah kamar di Kost ini', 403);
    }

    const { facilityIds, ...roomData } = data;

    const newRoom = await prisma.room.create({
      data: {
        ...roomData,
        facilities: facilityIds ? {
          connect: facilityIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        facilities: true,
      },
    });

    return newRoom;
  };

  public static getRooms = async (queryOptions: any = {}) => {
    if (!queryOptions.select && !queryOptions.include) {
      queryOptions.include = {
        facilities: true,
      };
    }

    const data = await prisma.room.findMany(queryOptions);
    const total = await prisma.room.count({ where: queryOptions.where });

    return { data, total };
  };

  public static getRoomById = async (id: string) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        facilities: true,
      },
    });
    if (!room) {
      throw new AppError('Kamar tidak ditemukan', 404);
    }
    return room;
  };

  public static updateRoom = async (id: string, ownerId: string, data: any) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { kost: true },
    });
    if (!room) {
      throw new AppError('Kamar tidak ditemukan', 404);
    }

    // Check ownership
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (user?.role !== 'ADMIN' && room.kost.ownerId !== ownerId) {
      throw new AppError('Kamu tidak memiliki izin untuk mengubah Kamar ini', 403);
    }

    const { facilityIds, ...roomData } = data;

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...roomData,
        facilities: facilityIds ? {
          set: facilityIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        facilities: true,
      },
    });

    return updatedRoom;
  };

  public static deleteRoom = async (id: string, ownerId: string) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { kost: true },
    });
    if (!room) {
      throw new AppError('Kamar tidak ditemukan', 404);
    }

    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (user?.role !== 'ADMIN' && room.kost.ownerId !== ownerId) {
      throw new AppError('Kamu tidak memiliki izin untuk menghapus Kamar ini', 403);
    }

    await prisma.room.delete({ where: { id } });
  };

  public static toggleSaveRoom = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new AppError('Kamar tidak ditemukan', 404);
    }

    const existingSavedRoom = await prisma.savedRoom.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingSavedRoom) {
      await prisma.savedRoom.delete({
        where: {
          userId_roomId: { userId, roomId },
        },
      });
      return { saved: false, message: 'Kamar berhasil dihapus dari favorit' };
    } else {
      await prisma.savedRoom.create({
        data: { userId, roomId },
      });
      return { saved: true, message: 'Kamar berhasil ditambahkan ke favorit' };
    }
  };

  public static getSavedRooms = async (userId: string, queryOptions: any = {}) => {
    if (!queryOptions.include) {
      queryOptions.include = {
        room: {
          include: {
            kost: true,
            facilities: true,
          }
        }
      };
    }
    
    // force where clause to only user's saved rooms
    queryOptions.where = {
      ...queryOptions.where,
      userId,
    };

    const data = await prisma.savedRoom.findMany(queryOptions);
    const total = await prisma.savedRoom.count({ where: queryOptions.where });

    return { data, total };
  };
}
