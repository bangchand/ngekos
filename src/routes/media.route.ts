import { Router } from 'express';
import { MediaController } from '@/controllers/media.controller';
import { validate } from '@/middlewares/validate.middleware';
import { restrictTo } from '@/middlewares/auth.middleware';
import { createMediaSchema, deleteMediaSchema } from '@/validators/media.validator';
import { asyncHandler } from '@/utils/async-handler';
import { upload } from '@/middlewares/upload.middleware';

const routerPrivate = Router();

routerPrivate.post(
  '/',
  upload.single('file'),
  restrictTo('ADMIN', 'OWNER', 'USER'),
  validate(createMediaSchema),
  asyncHandler(MediaController.createMedia)
);

routerPrivate.delete(
  '/:id',
  restrictTo('ADMIN', 'OWNER', 'USER'),
  validate(deleteMediaSchema),
  asyncHandler(MediaController.deleteMedia)
);

export const mediaRouter = { routerPrivate };
