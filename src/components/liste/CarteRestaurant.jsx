import { estDansLeBudget } from '../../utils/budget.js'
import { formaterNote } from '../../utils/notes.js'
import Icone, { IconeEtoile, VignetteCuisine } from '../../ui/Icone.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Une "carte" (vignette) de restaurant dans la vue Liste.
// Toute la vignette est un lien : grande zone facile à toucher sur mobile.
export default function CarteRestaurant({ restaurant, plafonds, stats, estFavori }) {
  const { cuisines } = useDonnees()
  const valide = estDansLeBudget(restaurant, plafonds)

  return (
    <a
      href={`#/restaurant/${restaurant.id}`}
      className="flex items-center gap-4 rounded-3xl bg-white p-3.5 shadow-[0_1px_2px_rgb(40_30_20/0.06),0_6px_18px_rgb(40_30_20/0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(40_30_20/0.12)]"
    >
      <VignetteCuisine cuisine={restaurant.cuisine} cuisines={cuisines} taille={60} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg leading-tight font-bold text-gray-900">{restaurant.nom}</h2>
          {estFavori && (
            <span className="text-tomate-600" title="Favori">
              <Icone nom="coeur" taille={18} plein />
              <span className="sr-only">Dans mes favoris</span>
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {restaurant.cuisine} · {restaurant.ville} ({restaurant.departement})
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1 font-bold text-gray-900">
            <IconeEtoile taille={14} className="text-etoile" />
            {stats ? formaterNote(stats.moyenne) : '–'}
            <span className="font-normal text-gray-600">{stats ? `(${stats.nombre})` : '(pas d’avis)'}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-bold ${
              valide ? 'bg-ok-fond text-ok' : 'bg-hors-fond text-hors'
            }`}
          >
            ~{restaurant.prixMoyen} € · {valide ? 'OK' : 'hors budget'}
          </span>
        </div>
      </div>
    </a>
  )
}
