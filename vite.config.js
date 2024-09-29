import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['web3'],
    // oder falls Probleme bestehen:
    // exclude: ['web3']
  },
  build: {
    commonjsOptions: {
      include: [/web3/],
    },
  },
});
