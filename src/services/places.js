// Appels du navigateur vers NOS fonctions serveur /api (qui, elles, parlent à Google).
import { service } from './donnees.js'

async function appelerApi(chemin) {
  const jeton = await service.jetonAcces()
  const reponse = await fetch(chemin, {
    headers: jeton ? { Authorization: `Bearer ${jeton}` } : {},
  })
  let donnees = null
  try {
    donnees = await reponse.json()
  } catch {
    // Réponse non JSON : typiquement, /api n'existe pas (ex. "vite preview")
  }
  if (!reponse.ok || !donnees) {
    throw new Error(donnees?.erreur || 'Service Google indisponible. Utilise la saisie manuelle.')
  }
  return donnees
}

/** Cherche un restaurant par nom ou lien Google Maps → liste de résultats. */
export async function rechercherPlaces(texte) {
  const { resultats } = await appelerApi(`/api/rechercher-restaurant?q=${encodeURIComponent(texte)}`)
  return resultats
}

/** Infos fraîches (téléphone, horaires, site, photo) d'un lieu Google. */
export async function detailsPlace(placeId) {
  return appelerApi(`/api/details-restaurant?placeId=${encodeURIComponent(placeId)}`)
}
