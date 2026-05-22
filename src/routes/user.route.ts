import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { validate } from '@/middlewares/validate.middleware';
import {
  getUserByIdSchema,
  updateUserSchema,
  deleteUserSchema,
} from '@/validators/user.validator';
import { protect, restrictTo } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

// Protect all user routes below
router.use(protect);

router.get('/', asyncHandler(UserController.getUsers));

router.get(
  '/:id',
  validate(getUserByIdSchema),
  asyncHandler(UserController.getUserById)
);

router.put(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(UserController.updateUser)
);

// Only ADMIN or OWNER can delete a user
router.delete(
  '/:id',
  restrictTo('ADMIN', 'OWNER'),
  validate(deleteUserSchema),
  asyncHandler(UserController.deleteUser)
);

export const userRouter = router;
