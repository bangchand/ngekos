import { Router } from 'express';
import { FacilityController } from '@/controllers/facility.controller';
import { validate } from '@/middlewares/validate.middleware';
import { protect, restrictTo } from '@/middlewares/auth.middleware';
import { createFacilitySchema, updateFacilitySchema, getFacilityByIdSchema } from '@/validators/facility.validator';
import { asyncHandler } from '@/utils/async-handler';

const routerPrivate = Router();

routerPrivate.use(protect);

routerPrivate.use(restrictTo('OWNER', 'ADMIN'));

routerPrivate.get('/', asyncHandler(FacilityController.getFacilities));

routerPrivate.get(
  '/:id', 
  validate(getFacilityByIdSchema),
  asyncHandler(FacilityController.getFacilityById)
);

routerPrivate.post(
  '/',
  restrictTo('ADMIN', 'OWNER'),
  validate(createFacilitySchema),
  asyncHandler(FacilityController.createFacility)
);

routerPrivate.patch(
  '/:id',
  restrictTo('ADMIN', 'OWNER'),
  validate(updateFacilitySchema),
  asyncHandler(FacilityController.updateFacility)
);

routerPrivate.delete(
  '/:id',
  restrictTo('ADMIN'),
  validate(getFacilityByIdSchema),
  asyncHandler(FacilityController.deleteFacility)
);

export const facilityRouter = { routerPrivate };