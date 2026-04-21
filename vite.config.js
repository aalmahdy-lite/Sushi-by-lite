import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve('certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve('certs/localhost-cert.pem')),
    },
  },
});
