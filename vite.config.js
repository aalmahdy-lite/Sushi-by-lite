import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Load ALL env vars (including un-prefixed ones). LITE_SECRET_KEY has no
  // VITE_ prefix on purpose, so it never leaks into the client bundle.
  const env = loadEnv(mode, process.cwd(), '');
  const secretKey = env.LITE_SECRET_KEY;

  return {
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve('certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve('certs/localhost-cert.pem')),
    },
    proxy: {
      // Proxy API calls to staging server-side to avoid browser CORS.
      // The browser calls same-origin /api/*, Vite forwards to the upstream.
      '/api': {
        target: 'https://api.lite.sa',
        changeOrigin: true,
        secure: false,
        // Inject the merchant secret server-side. Set LITE_SECRET_KEY in .env.
        // Kept out of the client bundle (no VITE_ prefix).
        // x-request-mode forces sandbox behaviour even with a live token.
        headers: {
          'x-request-mode': 'sandbox',
          ...(secretKey ? { Authorization: `Bearer ${secretKey}` } : {}),
        },
      },
    },
  },
  };
});
