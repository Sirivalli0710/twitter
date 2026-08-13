import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/register': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
      '/tweets': 'http://localhost:3000',
    }
  }
})
