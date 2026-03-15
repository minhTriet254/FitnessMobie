// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/Account': {
        target: 'http://localhost:5086',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5086',
        changeOrigin: true,
      },
    },
  },
  // Đảm bảo xử lý JSX trong cả .js và .jsx
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
})