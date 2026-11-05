import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';

export const postRegister = async (_req: Request, res: Response): Promise<void> => {
  res.status(201).json({ data: await registerUser(res.locals.registerInput) });
};

export const postLogin = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ data: await loginUser(res.locals.loginInput) });
};

// Solo devuelve la identidad verificada del token; no consulta MongoDB ni expone el token.
export const getMe = (_req: Request, res: Response): void => {
  res.status(200).json({ data: { identity: res.locals.auth } });
};
