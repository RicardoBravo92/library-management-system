import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

// Rate limit general para toda la API
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    error: 'Too many requests',
    message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit más estricto para login y registro (protección contra brute force)
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: {
    error: 'Too many login attempts',
    message: 'Demasiados intentos de acceso. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
