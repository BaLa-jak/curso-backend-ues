import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

// description es opcional: si no se envía, la tarea sigue siendo válida.
export const validateTaskDescription = (req: Request, res: Response, next: NextFunction): void => {
  const description: unknown = req.body?.description;

  if (description === undefined) {
    next();
    return;
  }

  if (typeof description !== 'string') {
    next(
      new AppError('La solicitud contiene datos inválidos.', 422, 'VALIDATION_ERROR', [
        { field: 'description', message: 'Debe ser texto.' },
      ]),
    );
    return;
  }

  if (description.trim().length > 300) {
    next(
      new AppError('La solicitud contiene datos inválidos.', 422, 'VALIDATION_ERROR', [
        { field: 'description', message: 'No debe superar 300 caracteres.' },
      ]),
    );
    return;
  }

  res.locals.taskDescription = description.trim();
  next();
};
