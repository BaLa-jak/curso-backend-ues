import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Debe coincidir con CORS_ORIGIN del backend; strictPort evita saltar a 5174 en silencio.
    port: 5173,
    strictPort: true,
  },
});
