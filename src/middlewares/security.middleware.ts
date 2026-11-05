import cors, { type CorsOptions } from 'cors';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Sin Origin: Postman, apps móviles o servidor a servidor.
    if (!origin || origin === env.corsOrigin) {
      callback(null, true);
      return;
    }
    // Rechazo sin error: solo se omite el encabezado CORS (no se convierte en 500).
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy'],
  maxAge: 600,
};

export const securityHeaders = helmet();
// Solo para /api-docs: Swagger UI necesita scripts y estilos propios que la CSP global bloquearía.
export const documentationSecurityHeaders = helmet({ contentSecurityPolicy: false });
export const corsPolicy = cors(corsOptions);

// shortcut: almacén en memoria, por proceso; con varias instancias usar un store compartido.
export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(_req, _res, next) {
    next(
      new AppError(
        'Demasiados intentos de autenticación. Intenta más tarde.',
        429,
        'AUTH_RATE_LIMIT_EXCEEDED',
      ),
    );
  },
});
