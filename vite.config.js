import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// Petit plugin maison : en développement (npm run dev), il fait tourner
// les fonctions du dossier /api comme le ferait Vercel en production.
// Ainsi, la recherche Google Places fonctionne aussi en local.
function apiLocale() {
  return {
    name: 'api-locale',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const nom = new URL(req.url, 'http://localhost').pathname.slice(5)
        // Sécurité : seulement des noms simples (pas de "../")
        if (!/^[a-z-]+$/.test(nom)) return next()
        try {
          const module = await server.ssrLoadModule(`/api/${nom}.js`)
          await module.default(req, res)
        } catch (erreur) {
          console.error(erreur)
          res.statusCode = 404
          res.end(JSON.stringify({ erreur: 'Route API inconnue.' }))
        }
      })
    },
  }
}

// Configuration de Vite (l'outil qui lance et construit l'app).
export default defineConfig(({ mode }) => {
  // Charge TOUTES les variables du fichier .env (y compris GOOGLE_PLACES_API_KEY,
  // qui n'a pas le préfixe VITE_ et reste donc côté serveur uniquement).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), apiLocale()],
    server: {
      // host: true rend l'app accessible depuis ton téléphone (même Wi-Fi).
      host: true,
    },
    test: {
      // Configuration des tests automatiques (Vitest)
      include: ['tests/**/*.test.js'],
    },
  }
})
