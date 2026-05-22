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

const router = Router();

// Protect all kost routes below
router.use(protect);

// Allow only OWNER and ADMIN to perform Kost operations
router.use(restrictTo('OWNER', 'ADMIN'));

router.get('/', asyncHandler(KostController.getKosts));

router.get(
  '/:id',
  validate(getKostByIdSchema),
  asyncHandler(KostController.getKostById)
);

router.post(
  '/',
  validate(createKostSchema),
  asyncHandler(KostController.createKost)
);

router.put(
  '/:id',
  validate(updateKostSchema),
  asyncHandler(KostController.updateKost)
);

router.delete(
  '/:id',
  validate(getKostByIdSchema),
  asyncHandler(KostController.deleteKost)
);

export const kostRouter = router;
