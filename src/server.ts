import 'dotenv/config';
import type { Server } from 'node:http';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';

let server: Server | undefined;
let isShuttingDown = false;

const closeHttpServer = (httpServer: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

// Cierra primero HTTP (deja de aceptar solicitudes) y después MongoDB.
const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Señal ${signal} recibida. Cerrando la API...`);

  try {
    if (server) {
      await closeHttpServer(server);
      console.log('Servidor HTTP cerrado.');
    }
    await disconnectDatabase();
    process.exitCode = 0;
  } catch {
    console.error('No fue posible completar el cierre ordenado de la API.');
    process.exitCode = 1;
  }
};

const startServer = async (): Promise<void> => {
  try {
    const env = loadEnvironment();

    await connectDatabase({
      uri: env.mongodbUri,
      dbName: env.mongodbDbName,
    });

    // Si llegó una señal mientras se conectaba, no se abre el puerto.
    if (isShuttingDown) {
      await disconnectDatabase();
      return;
    }

    server = app.listen(env.port, () => {
      console.log(`API disponible en http://localhost:${env.port}`);
    });
  } catch {
    console.error(
      'No fue posible iniciar la API. Revise MONGODB_URI, ' +
        'el usuario y la lista de acceso de red.',
    );
    process.exitCode = 1;
  }
};

process.once('SIGINT', (signal) => void shutdown(signal));
process.once('SIGTERM', (signal) => void shutdown(signal));

void startServer();
