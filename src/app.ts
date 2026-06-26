import { logger } from '@/utils/logger';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { apiRouter } from '@/routes';
import { rateLimiter } from '@/middlewares/rate-limit.middleware';
import { errorHandler } from '@/middlewares/error.middleware';
import { protect } from '@/middlewares/auth.middleware';
import { AppError } from '@/utils/app-error';
import { ApiResponse } from '@/utils/api-response';
import { env } from '@/config/env';

const app: Express = express();

// Trust proxy is required if you are behind a reverse proxy (e.g. Ngrok, Nginx, Heroku)
// This fixes the 'express-rate-limit' warning about X-Forwarded-For header.
app.set('trust proxy', 1);

// Gunakan query parser 'extended' (berbasis library qs) agar dapat mem-parse nested object/array.
// Hal ini sangat penting untuk PrismaQueryBuilder karena Express 5 defaultnya 'simple'.
app.set('query parser', 'extended');

// ==========================================
// Global Middlewares
// ==========================================

// 1. Security HTTP headers
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins for development, customize for production
    credentials: true,
  })
);

// 3. Gzip compression
app.use(compression());

// 4. Request Logging using Morgan
const morganFormat = env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: { write: (message) => logger.http(message.trim()) } }));

// 5. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Cookie Parser
app.use(cookieParser());

// 7. Global API Rate Limiter
app.use('/api', rateLimiter);

// 8. Serve Static Files (For Uploads)
import path from 'path';
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// ==========================================
// Base Routes & API Mounting
// ==========================================

// Simple Healthcheck endpoint
app.get('/health', (req: Request, res: Response) => {
  return ApiResponse.success(res, 'Server is healthy!', { timestamp: new Date().toISOString() });
});

// Public Route
app.get('/BqSEOywguVg5llYm22', (req: Request, res: Response) => {
  return ApiResponse.success(res, 'This is a public route, accessible to everyone.');
});

// Private/Protected Route
app.get('/NCOrzLzAq5mC2RuZiG', protect, (req: Request, res: Response) => {
  return ApiResponse.success(res, 'This is a protected route. You have successfully authenticated.', { user: req.user });
});

// Mount modular routes under /api/v1
app.use('/api/v1', apiRouter);

// ==========================================
// Error Handling
// ==========================================

// Handle unhandled routes (404s)
app.all('/*splat', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Rute ${req.originalUrl} tidak ditemukan di server ini!`, 404));
});

// Global Error Handler Middleware (Must be last)
app.use(errorHandler);

export { app };
export default app;
