// Déduit le numéro de département à partir d'un code postal français.
// Exemples : "60260" → "60", "75012" → "75", "97400" → "974", "20000" → "2A".
// Renvoie null si le code postal n'est pas valide.

export function departementDepuisCodePostal(codePostal) {
  const cp = String(codePostal ?? '').trim()
  if (!/^\d{5}$/.test(cp)) return null

  // Outre-mer : les 3 premiers chiffres (971 Guadeloupe, 974 Réunion…)
  if (cp.startsWith('97') || cp.startsWith('98')) return cp.slice(0, 3)

  // Corse : codes postaux 20xxx → 2A (Corse-du-Sud) ou 2B (Haute-Corse)
  if (cp.startsWith('20')) return Number(cp) < 20200 ? '2A' : '2B'

  return cp.slice(0, 2)
}
