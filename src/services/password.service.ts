import bcrypt from 'bcryptjs';
import { AppError } from '../errors/app-error.js';
import { MAX_PASSWORD_BYTES } from '../types/auth.js';

const BCRYPT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  // bcrypt ignora en silencio lo que pase de 72 bytes.
  if (bcrypt.truncates(password)) {
    throw new AppError(
      `La contraseña no debe superar ${MAX_PASSWORD_BYTES} bytes en UTF-8.`,
      422,
      'AUTH_VALIDATION_ERROR',
      [{ field: 'password', message: `No debe superar ${MAX_PASSWORD_BYTES} bytes en UTF-8.` }],
    );
  }

  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = (password: string, passwordHash: string): Promise<boolean> =>
  bcrypt.compare(password, passwordHash);
