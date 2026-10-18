// Outils partagés par les fonctions serveur de /api.
// Les fichiers qui commencent par "_" ne sont pas exposés comme des routes par Vercel.
//
// Ces fonctions tournent sur le SERVEUR (Vercel, ou Vite en local) :
// la clé Google n'est donc jamais envoyée au navigateur.

/** Envoie une réponse JSON (fonctionne avec Vercel et avec le serveur de dev Vite). */
export function repondre(res, statut, donnees) {
  res.statusCode = statut
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(donnees))
}

/** Lit un paramètre de l'URL : /api/x?q=pizza → parametre(req, 'q') === 'pizza' */
export function parametre(req, nom) {
  return new URL(req.url, 'http://localhost').searchParams.get(nom)
}

/**
 * Vérifie que l'appel vient d'un collègue connecté (jeton Supabase valide).
 * Sans cette vérification, n'importe qui pourrait utiliser notre quota Google.
 * Si Supabase n'est pas configuré (mode démo), on laisse passer.
 */
export async function verifierUtilisateur(req) {
  const url = process.env.VITE_SUPABASE_URL
  const cleAnon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !cleAnon || url.includes('votre-projet')) return true

  const autorisation = req.headers.authorization
  if (!autorisation) return false

  const reponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: cleAnon, Authorization: autorisation },
  })
  return reponse.ok
}

/** Clé Google lue côté serveur (variable SANS préfixe VITE_). */
export function cleGoogle() {
  return process.env.GOOGLE_PLACES_API_KEY || null
}
