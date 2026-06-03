import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = (env.VITE_FOOTBALL_API_KEY ?? '').trim()

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Browser calls /football-api/... → Vite forwards to football-data.org
        // The auth header is added here (server-side), never exposed in the browser
        '/football-api': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/football-api/, ''),
          headers: { 'X-Auth-Token': apiKey },
        },
      },
    },
  }
})
