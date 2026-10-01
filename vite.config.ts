import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tmdbHandler from './netlify/functions/tmdb.mts'

// `npm run dev` doesn't run Netlify Functions, so serve the TMDB proxy from
// the same handler here, with the key from .env (never exposed to the client).
function tmdbProxy(apiKey: string | undefined): Plugin {
  return {
    name: 'tmdb-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        if (apiKey) process.env.TMDB_API_KEY ??= apiKey
        const response = await tmdbHandler(new Request(new URL(req.originalUrl ?? '/', 'http://localhost')))
        res.statusCode = response.status
        response.headers.forEach((value, name) => res.setHeader(name, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tmdbProxy(env.TMDB_API_KEY)],
  }
})
