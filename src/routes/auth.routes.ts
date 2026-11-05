import { Router } from 'express';
import { getMe, postLogin, postRegister } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';
import { validateLogin, validateRegister } from '../middlewares/validate-auth.middleware.js';

export const authRouter = Router();

// El límite se aplica solo a los intentos de credenciales; /me no consume el cupo.
authRouter.post('/register', authRateLimiter, requireJson, validateRegister, postRegister);
authRouter.post('/login', authRateLimiter, requireJson, validateLogin, postLogin);
authRouter.get('/me', authenticate, getMe);
