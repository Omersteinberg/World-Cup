import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = (env.VITE_FOOTBALL_API_KEY ?? '').trim()

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'DaxHub',
          short_name: 'DaxHub',
          description: 'The official dashboard keeping the fellas honest.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ]
        }
      })
    ],
    server: {
      proxy: {
        // Matches the Vercel serverless function path so dev + prod use the same URL
        '/api/football': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/football/, ''),
          headers: { 'X-Auth-Token': apiKey },
        },
      },
    },
  }
})