import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /fixacv/
  // Custom domain: /
  base: '/fixacv/',
  server: {
    port: 3001,
  },
})
