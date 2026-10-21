import 'dotenv/config';

const requireEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
};

const readPort = (): number => {
  const port = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
  }

  return port;
};

const readJwtSecret = (): string => {
  const secret = requireEnvironmentVariable('JWT_SECRET');

  if (Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET debe contener al menos 32 bytes.');
  }

  return secret;
};

const readJwtExpiration = (): string => {
  const value = process.env.JWT_EXPIRES_IN?.trim() || '1h';

  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error('JWT_EXPIRES_IN debe usar un formato como 15m, 1h o 7d.');
  }

  return value;
};

export interface EnvironmentConfig {
  port: number;
  mongodbUri: string;
  mongodbDbName: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtIssuer: string;
  jwtAudience: string;
}

export const loadEnvironment = (): EnvironmentConfig => {
  return {
    port: readPort(),
    mongodbUri: requireEnvironmentVariable('MONGODB_URI'),
    mongodbDbName: requireEnvironmentVariable('MONGODB_DB_NAME'),
    jwtSecret: readJwtSecret(),
    jwtExpiresIn: readJwtExpiration(),
    jwtIssuer: process.env.JWT_ISSUER?.trim() || 'task-api-express',
    jwtAudience: process.env.JWT_AUDIENCE?.trim() || 'task-api-client',
  };
};

// Se valida al cargar el proceso: un secreto ausente detiene el arranque.
export const env: Readonly<EnvironmentConfig> = Object.freeze(loadEnvironment());
