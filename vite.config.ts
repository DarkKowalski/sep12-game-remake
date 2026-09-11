import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Static build: relative base so `dist/` can be dropped on any host
// (GitHub Pages project sites, S3 subfolders, itch.io zips) without rewriting.
export default defineConfig({
  base: './',
  plugins: [
    // The whole game is a handful of files and no runtime requests, so it
    // precaches cleanly: once loaded it runs offline and installs to a phone
    // home screen. The manifest lives in public/ and is left as-is.
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
      },
    }),
  ],
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Keep three.js in its own chunk so the tiny game code can be
        // re-deployed without busting the big vendor cache entry.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          return undefined
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
