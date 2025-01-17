import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dashboard': {
        target: 'http://localhost:8619',  // Backend URL
        ws: true,  // Enable WebSocket support
        changeOrigin: true,  // Change the origin of the request
      },
    },    
    port: 5173, 
  },
});