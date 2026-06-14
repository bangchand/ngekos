import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new AppError('Terlalu banyak request dari IP ini, silakan coba lagi nanti.', 429));
  },
});
