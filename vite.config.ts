import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rajaongkir': {
        target: 'https://rajaongkir.komerce.id/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rajaongkir/, ''),
        secure: false,
      },
    },
  },
})

