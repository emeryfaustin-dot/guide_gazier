import BadgeBudget from '../../ui/BadgeBudget.jsx'
import BadgeHalal from '../../ui/BadgeHalal.jsx'
import { IconeEtoile, VignetteCuisine } from '../../ui/Icone.jsx'
import { styleCuisine } from '../../config/cuisines.js'
import { formaterNote } from '../../utils/notes.js'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Petite fiche affichée quand on clique sur un pin.
// Remarque : on utilise des <div> et non des <p>, car la feuille de style de
// Leaflet impose de grandes marges aux <p> dans les fiches.
export default function FicheResumee({ restaurant, plafonds, stats }) {
  const { cuisines } = useDonnees()
  const style = styleCuisine(restaurant.cuisine, cuisines)
  return (
    <div className="w-64 text-sm leading-snug text-gray-900">
      <div className="flex gap-3">
        <VignetteCuisine cuisine={restaurant.cuisine} cuisines={cuisines} taille={48} arrondi={14} />
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wider uppercase" style={{ color: style.texte }}>
            {restaurant.cuisine} · {restaurant.ville}
          </div>
          <h2 className="text-lg leading-tight font-bold">{restaurant.nom}</h2>
          <div className="mt-0.5 flex items-center gap-1 text-gray-600">
            <IconeEtoile taille={13} className="text-etoile" />
            <strong className="text-gray-900">{formaterNote(stats?.moyenne)}</strong>
            {stats ? `(${stats.nombre} avis)` : ''} · ~{restaurant.prixMoyen} €
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <BadgeBudget restaurant={restaurant} plafonds={plafonds} compact />
        {restaurant.halal && <BadgeHalal />}
      </div>

      {/* Un simple lien suffit : la navigation se fait par l'adresse "#/restaurant/…" */}
      <a
        href={`#/restaurant/${restaurant.id}`}
        className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-natran-400 font-bold !text-gray-950 no-underline hover:bg-natran-500"
      >
        Voir la fiche
      </a>
    </div>
  )
}
