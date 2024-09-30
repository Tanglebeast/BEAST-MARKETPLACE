import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// vite.config.js
export default {
  server: {
    proxy: {
      '/ipfs': {
        target: 'https://ipfs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ipfs/, '')
      }
    }
  }
}

