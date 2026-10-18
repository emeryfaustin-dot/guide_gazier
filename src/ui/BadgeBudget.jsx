import { estDansLeBudget, trouverPlafond } from '../utils/budget.js'

// Badge "Validé" / "Hors budget" : texte + symbole + couleur (jamais la couleur seule).
export default function BadgeBudget({ restaurant, plafonds, compact = false }) {
  const plafond = trouverPlafond(restaurant.departement, plafonds)
  const valide = estDansLeBudget(restaurant, plafonds)

  let texte
  if (valide) texte = compact ? '✓ Dans le budget' : `✓ Dans le budget (plafond ${plafond} €)`
  else if (plafond === null) texte = '! Plafond non défini'
  else texte = compact ? '! Hors budget' : `! Hors budget (plafond ${plafond} €)`

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-sm font-semibold ${
        valide ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-950'
      }`}
    >
      {texte}
    </span>
  )
}
