import { Router } from 'express';
import { authRouter } from '@/routes/auth.route';
import { userRouter } from '@/routes/user.route';
import { kostRouter } from '@/routes/kost.route';
import { protect } from '@/middlewares/auth.middleware';

const router = Router();
const publicRoutes = Router();
const protectedRoutes = Router();

// Public Routes (no token required)
// Assuming authRouter handles login/register and should be public
publicRoutes.use('/auth', authRouter);

// Protected Routes (token required)
// Assuming userRouter handles profiles etc and should be protected
protectedRoutes.use('/users', userRouter);
protectedRoutes.use('/kosts', kostRouter);

// Mount them
router.use('/BqSEOywguVg5llYm22', publicRoutes);
router.use('/1zCg1406d2x331wM', protect, protectedRoutes);

export const apiRouter = router;
export default apiRouter;
