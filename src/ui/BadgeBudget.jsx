import { estDansLeBudget, trouverPlafond } from '../utils/budget.js'
import Icone from './Icone.jsx'

// Badge "Dans le budget" / "Hors budget" : texte + icône + couleur (jamais la couleur seule).
export default function BadgeBudget({ restaurant, plafonds, compact = false }) {
  const plafond = trouverPlafond(restaurant.departement, plafonds)
  const valide = estDansLeBudget(restaurant, plafonds)

  let texte
  if (valide) texte = compact ? 'Dans le budget' : `Dans le budget (plafond ${plafond} €)`
  else if (plafond === null) texte = 'Plafond non défini'
  else texte = compact ? 'Hors budget' : `Hors budget (plafond ${plafond} €)`

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-sm font-bold ${
        valide ? 'bg-ok-fond text-ok' : 'bg-hors-fond text-hors'
      }`}
    >
      <Icone nom={valide ? 'coche' : 'alerte'} taille={14} epaisseur={2.6} />
      {texte}
    </span>
  )
}
