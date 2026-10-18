// Règle métier principale : un restaurant est "validé" si son prix moyen
// par personne ne dépasse pas le plafond de SON département.
//
// Les plafonds ne sont PAS codés ici : ils sont passés en paramètre
// (aujourd'hui depuis plafonds.json, demain depuis la base Supabase).

/**
 * Renvoie le plafond (en €) d'un département, ou null s'il n'est pas configuré.
 * @param {string} departement - ex : "60"
 * @param {Array} plafonds - liste [{ departement, nom, plafond }]
 */
export function trouverPlafond(departement, plafonds) {
  const ligne = plafonds.find((p) => p.departement === departement)
  return ligne ? ligne.plafond : null
}

/**
 * Vérifie si un restaurant respecte le plafond de son département.
 * Si le département n'a pas de plafond configuré, on considère
 * le restaurant comme NON validé (prudence : l'admin doit d'abord fixer un plafond).
 */
export function estDansLeBudget(restaurant, plafonds) {
  const plafond = trouverPlafond(restaurant.departement, plafonds)
  if (plafond === null) return false
  return restaurant.prixMoyen <= plafond
}

/**
 * Contrôle utilisé au moment de l'AJOUT d'un restaurant (Phase 6).
 * Renvoie un objet { ok, plafond, message } facile à afficher dans le formulaire.
 */
export function verifierBudget(departement, prixMoyen, plafonds) {
  const plafond = trouverPlafond(departement, plafonds)
  const prix = Number(prixMoyen)

  if (!departement) return { ok: false, plafond, message: 'Département inconnu : vérifie le code postal.' }
  if (plafond === null)
    return { ok: false, plafond, message: `Aucun plafond n'est défini pour le département ${departement}. Demande à l'administrateur de l'ajouter.` }
  if (!prix || prix <= 0) return { ok: false, plafond, message: 'Indique le prix moyen par personne.' }
  if (prix > plafond)
    return { ok: false, plafond, message: `Hors budget : ${prix} € dépasse le plafond de ${plafond} € du département ${departement}.` }
  return { ok: true, plafond, message: `Dans le budget : ${prix} € ≤ plafond de ${plafond} €.` }
}
