import { Router } from 'express';
import { RoomController } from '@/controllers/room.controller';
import { validate } from '@/middlewares/validate.middleware';
import { restrictTo } from '@/middlewares/auth.middleware';
import { createRoomSchema, updateRoomSchema, getRoomByIdSchema } from '@/validators/room.validator';
import { asyncHandler } from '@/utils/async-handler';
import { upload, parseFormDataJson } from '@/middlewares/upload.middleware';

const routerPrivate = Router();
const routerPublic = Router();

routerPublic.get('/', asyncHandler(RoomController.getRooms));

routerPublic.get(
  '/:id',
  validate(getRoomByIdSchema),
  asyncHandler(RoomController.getRoomById)
);

routerPrivate.get('/', asyncHandler(RoomController.getRooms));

routerPrivate.get(
  '/:id',
  validate(getRoomByIdSchema),
  asyncHandler(RoomController.getRoomById)
);

routerPrivate.post(
  '/',
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]),
  parseFormDataJson,
  restrictTo('ADMIN', 'OWNER'),
  validate(createRoomSchema),
  asyncHandler(RoomController.createRoom)
);

routerPrivate.patch(
  '/:id',
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]),
  parseFormDataJson,
  restrictTo('ADMIN', 'OWNER'),
  validate(updateRoomSchema),
  asyncHandler(RoomController.updateRoom)
);

routerPrivate.delete(
  '/:id',
  restrictTo('ADMIN', 'OWNER'),
  validate(getRoomByIdSchema),
  asyncHandler(RoomController.deleteRoom)
);

export const roomRouter = { routerPublic, routerPrivate };
