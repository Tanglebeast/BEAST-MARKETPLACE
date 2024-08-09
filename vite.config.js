import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      './errors.js': 'node_modules/web3-rpc-providers/lib/esm/errors.js',
    },
  },
})
