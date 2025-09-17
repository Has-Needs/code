import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ThemePlugin } from '@dxos/react-components/plugin';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    ThemePlugin({
      content: [
        resolve(__dirname, './index.html'),
        resolve(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
        resolve(__dirname, 'node_modules/@dxos/react-components/dist/**/*.mjs'),
      ]
    })
  ],
  optimizeDeps: {
    include: [
      'chalk',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
