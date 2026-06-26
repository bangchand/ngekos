import { Router } from 'express';
import { KostController } from '@/controllers/kost.controller';
import { validate } from '@/middlewares/validate.middleware';
import {
  createKostSchema,
  updateKostSchema,
  getKostByIdSchema,
} from '@/validators/kost.validator';
import { protect, restrictTo } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';
import { upload, parseFormDataJson } from '@/middlewares/upload.middleware';

const routerPrivate = Router();
const routerPublic = Router();

// Public routes
routerPublic.get('/', asyncHandler(KostController.getKosts));

routerPublic.get(
  '/:id',
  validate(getKostByIdSchema),
  asyncHandler(KostController.getKostById)
);

routerPrivate.use(protect);

routerPrivate.use(restrictTo('OWNER', 'ADMIN'));

routerPrivate.get('/', asyncHandler(KostController.getKosts));

routerPrivate.post(
  '/',
  validate(createKostSchema),
  asyncHandler(KostController.createKost)
);

routerPrivate.put(
  '/:id',
  validate(updateKostSchema),
  asyncHandler(KostController.updateKost)
);

routerPrivate.delete(
  '/:id',
  validate(getKostByIdSchema),
  asyncHandler(KostController.deleteKost)
);

export const kostRouter = { routerPublic, routerPrivate };
