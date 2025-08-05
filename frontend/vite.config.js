import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the backend URL from environment variable or default to localhost in development
const backendUrl = process.env.VITE_API_URL || 'https://teen-poll14-backend.onrender.com'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': backendUrl,
    },
    hmr: {
      overlay: true,
      timeout: 30000,
    },
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: true,
    port: 3001,
    allowedHosts: ['teen-poll14-frontend.onrender.com', 'poll.1wit,hyin.com', 'myworldmysay.com',
      'www.myworldmysay.com'],
  },
}) 