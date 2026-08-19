import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Reddit's JSON API sends no Access-Control-Allow-Origin header, so the
      // browser blocks direct cross-origin fetches. Route through the dev
      // server (a server-to-server request) to avoid the browser CORS check.
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, '')
      },
      // Token endpoint for application-only OAuth (see src/redux/redditAuth.js)
      '/reddit-oauth': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-oauth/, '')
      },
      // Authenticated, read-only data API used once an access token is obtained
      '/reddit-oauth-api': {
        target: 'https://oauth.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-oauth-api/, '')
      }
    }
  }
})
