// Logique de la recherche et des filtres (Phase 2).
// Fonctions "pures" : elles ne touchent pas à l'écran, ce qui les rend faciles à tester.

import { estDansLeBudget } from './budget.js'

// Valeurs des filtres au démarrage (aucun filtre actif).
export const FILTRES_PAR_DEFAUT = {
  texte: '',
  cuisine: '', // '' = toutes
  departement: '', // '' = tous
  budgetMax: null, // null = pas de limite
  dansLePlafond: false, // true = seulement les restaurants "validés budget"
  noteMin: null, // null = toutes les notes
  favorisSeulement: false,
}

/**
 * Met un texte en minuscules et retire les accents,
 * pour que "creme" trouve "Crème" et "francais" trouve "Français".
 */
export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Le restaurant correspond-il au texte recherché (nom, ville ou cuisine) ? */
export function correspondAuTexte(restaurant, texte) {
  const recherche = normaliser(texte)
  if (!recherche) return true
  const cible = normaliser(`${restaurant.nom} ${restaurant.ville} ${restaurant.cuisine}`)
  // Tous les mots tapés doivent être présents : "pizza meaux" fonctionne.
  return recherche.split(/\s+/).every((mot) => cible.includes(mot))
}

/**
 * Applique tous les filtres à la liste des restaurants.
 * @param {Array} restaurants
 * @param {object} filtres - voir FILTRES_PAR_DEFAUT
 * @param {object} contexte - { plafonds, stats (notes), favoris (Set d'ids) }
 */
export function filtrerRestaurants(restaurants, filtres, { plafonds, stats = {}, favoris = new Set() }) {
  return restaurants.filter((r) => {
    if (!correspondAuTexte(r, filtres.texte)) return false
    if (filtres.cuisine && r.cuisine !== filtres.cuisine) return false
    if (filtres.departement && r.departement !== filtres.departement) return false
    if (filtres.budgetMax != null && r.prixMoyen > filtres.budgetMax) return false
    if (filtres.dansLePlafond && !estDansLeBudget(r, plafonds)) return false
    if (filtres.noteMin != null) {
      const moyenne = stats[r.id]?.moyenne
      if (moyenne == null || moyenne < filtres.noteMin) return false
    }
    if (filtres.favorisSeulement && !favoris.has(r.id)) return false
    return true
  })
}

/** Nombre de filtres actifs (hors texte), pour l'afficher sur le bouton "Filtres". */
export function compterFiltresActifs(filtres) {
  let n = 0
  if (filtres.cuisine) n++
  if (filtres.departement) n++
  if (filtres.budgetMax != null) n++
  if (filtres.dansLePlafond) n++
  if (filtres.noteMin != null) n++
  if (filtres.favorisSeulement) n++
  return n
}
