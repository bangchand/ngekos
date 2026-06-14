import { Router } from 'express';
import { authRouter } from '@/routes/auth.route';
import { userRouter } from '@/routes/user.route';
import { kostRouter } from '@/routes/kost.route';
import { facilityRouter } from '@/routes/facility.route';
import { fonnteRouter } from '@/routes/fonnte.route';
import { roomRouter } from '@/routes/room.route';
import { mediaRouter } from '@/routes/media.route';
import { protect, restrictTo } from '@/middlewares/auth.middleware';

const router = Router();
const publicRoutes = Router();
const protectedRoutes = Router();
protectedRoutes.use(restrictTo('OWNER', 'ADMIN', 'USER'));

// Public Routes (no token required)
// Assuming authRouter handles login/register and should be public
publicRoutes.use('/auth', authRouter);
publicRoutes.use('/fonnte', fonnteRouter);
publicRoutes.use('/kosts', kostRouter.routerPublic);

// Protected Routes (token required)
// Assuming userRouter handles profiles etc and should be protected
protectedRoutes.use('/users', userRouter);
protectedRoutes.use('/kosts', kostRouter.routerPrivate);
protectedRoutes.use('/facilities', facilityRouter.routerPrivate);
protectedRoutes.use('/rooms', roomRouter.routerPrivate);
protectedRoutes.use('/media', mediaRouter.routerPrivate);

// Mount them
router.use('/BqSEOywguVg5llYm22', publicRoutes);
router.use('/1zCg1406d2x331wM', protect, protectedRoutes);

export const apiRouter = router;
export default apiRouter;
