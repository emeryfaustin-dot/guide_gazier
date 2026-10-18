import BadgeBudget from '../../ui/BadgeBudget.jsx'
import { formaterNote } from '../../utils/notes.js'

// Une "carte" (vignette) de restaurant dans la vue Liste.
// Toute la vignette est un lien : grande zone facile à toucher sur mobile.
export default function CarteRestaurant({ restaurant, plafonds, stats, estFavori }) {
  return (
    <a
      href={`#/restaurant/${restaurant.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">{restaurant.nom}</h2>
        {estFavori && (
          <span className="text-xl text-red-700" title="Favori">
            <span aria-hidden="true">♥</span>
            <span className="sr-only">Dans mes favoris</span>
          </span>
        )}
      </div>
      <p className="text-gray-700">
        {restaurant.cuisine} · {restaurant.ville} ({restaurant.departement})
      </p>
      <p className="mt-1 text-gray-800">
        <span className="text-amber-700" aria-hidden="true">
          ★
        </span>{' '}
        {formaterNote(stats?.moyenne)}
        {stats ? ` (${stats.nombre} avis)` : ' (pas encore d’avis)'} · ~{restaurant.prixMoyen} € / pers.
      </p>
      <div className="mt-2">
        <BadgeBudget restaurant={restaurant} plafonds={plafonds} compact />
      </div>
    </a>
  )
}
