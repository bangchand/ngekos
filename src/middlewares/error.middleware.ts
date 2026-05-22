import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '@/utils/app-error';
import { env } from '@/config/env';
import { ApiResponse } from '@/utils/api-response';
import { logger } from '@/utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  if (env.NODE_ENV === 'development') {
    logger.error(`[Error Handler] ${err.message}`, { stack: err.stack });
  } else {
    logger.error(`[Error Handler] ${err.message}`);
  }

  // Handle Prisma Unique Constraint Violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) || [];
      const message = `Duplicate field value: ${fields.join(', ')}. Please use another value!`;
      error = new AppError(message, 400);
    }
    if (err.code === 'P2025') {
      const message = err.meta?.cause as string || 'Record not found';
      error = new AppError(message, 404);
    }
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    error = new AppError('Validation failed', 400, formattedErrors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  // Send response
  if (error instanceof AppError && error.isOperational) {
    ApiResponse.error(res, error.message, error.errors, error.statusCode);
  } else {
    // Programming or other unknown errors: don't leak leak details to client
    const message = env.NODE_ENV === 'production' ? 'Something went very wrong!' : err.message;
    ApiResponse.error(
      res,
      message,
      env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
      500
    );
  }
};
