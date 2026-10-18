// Calculs autour des notes (1 à 5) laissées par les collègues.

/**
 * Regroupe les avis par restaurant et calcule la note moyenne + le nombre d'avis.
 * Renvoie un objet : { [restaurantId]: { moyenne: 4.3, nombre: 3 } }
 */
export function statistiquesNotes(avis) {
  const stats = {}
  for (const a of avis) {
    const s = (stats[a.restaurantId] ??= { total: 0, nombre: 0 })
    s.total += a.note
    s.nombre += 1
  }
  const resultat = {}
  for (const [id, s] of Object.entries(stats)) {
    resultat[id] = { moyenne: Math.round((s.total / s.nombre) * 10) / 10, nombre: s.nombre }
  }
  return resultat
}

/** Formate une note pour l'affichage : 4.25 → "4,3" ; pas de note → "–" */
export function formaterNote(moyenne) {
  if (moyenne == null) return '–'
  return moyenne.toFixed(1).replace('.', ',')
}
