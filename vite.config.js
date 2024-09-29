import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'web3': require.resolve('web3/dist/web3.min.js')
    }
  },
  optimizeDeps: {
    exclude: ['web3']
  }
})
