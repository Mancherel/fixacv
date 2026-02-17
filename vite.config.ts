import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      // @react-pdf/pdfkit imports pako/lib/zlib/*.js — resolve to the copy
      // inside browserify-zlib's nested node_modules so Rollup can find it.
      pako: path.resolve(__dirname, 'node_modules/browserify-zlib/node_modules/pako'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.svg', 'pwa-512.svg', 'vite.svg'],
      manifest: {
        name: 'fixacv',
        short_name: 'fixacv',
        description: 'Privacy-first CV builder. Create professional CVs in your browser.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          {
            src: 'pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  // GitHub Pages: /fixacv/
  // Custom domain: /
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
})
