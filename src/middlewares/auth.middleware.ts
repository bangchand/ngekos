import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { asyncHandler } from '@/utils/async-handler';

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // 1. Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError('Kamu belum login! Silakan login untuk mendapatkan akses.', 401)
      );
    }

    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(
        new AppError('Pengguna dengan token ini tidak lagi tersedia.', 401)
      );
    }

    // 5. Grant access to protected route and assign user to req object
    req.user = user;
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user must exist at this point (because of protect middleware)
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return next(
        new AppError('Kamu tidak memiliki izin untuk melakukan aksi ini', 403)
      );
    }
    next();
  };
};
