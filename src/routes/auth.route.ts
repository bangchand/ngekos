import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validate.middleware';
import { registerSchema, loginSchema } from '@/validators/auth.validator';
import { protect } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.get('/profile', protect, asyncHandler(AuthController.getProfile));

export const authRouter = router;
