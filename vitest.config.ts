import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup-env.ts'],
    // Los middlewares guardan estado global (p. ej. el contador del limitador).
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
    // Solo la suite del backend; client/ tiene su propio paquete.
    include: ['tests/**/*.test.ts'],
  },
});
