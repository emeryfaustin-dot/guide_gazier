import BadgeBudget from '../../ui/BadgeBudget.jsx'
import { formaterNote } from '../../utils/notes.js'

// Petite fiche affichée quand on clique sur un marqueur.
// Remarque : on utilise des <div> et non des <p>, car la feuille de style de
// Leaflet impose de grandes marges aux <p> dans les fiches.
export default function FicheResumee({ restaurant, plafonds, stats }) {
  return (
    <div className="min-w-52 text-sm leading-snug">
      <h2 className="text-base font-bold text-gray-900">{restaurant.nom}</h2>

      <div className="mt-1 text-gray-700">
        {restaurant.cuisine} · {restaurant.ville} ({restaurant.departement})
      </div>

      <div className="mt-1 text-gray-700">
        <span aria-hidden="true">★</span> {formaterNote(stats?.moyenne)} / 5
        {stats ? ` (${stats.nombre} avis)` : ''} · ~{restaurant.prixMoyen} € / pers.
      </div>

      <div className="mt-2">
        <BadgeBudget restaurant={restaurant} plafonds={plafonds} compact />
      </div>

      {/* Un simple lien suffit : la navigation se fait par l'adresse "#/restaurant/…" */}
      <a
        href={`#/restaurant/${restaurant.id}`}
        className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-blue-800 font-semibold !text-white no-underline hover:bg-blue-900"
      >
        Voir la fiche
      </a>
    </div>
  )
}
