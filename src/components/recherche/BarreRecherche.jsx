import { useState } from 'react'
import PanneauFiltres from './PanneauFiltres.jsx'
import { compterFiltresActifs } from '../../utils/filtres.js'
import { styleCuisine } from '../../config/cuisines.js'
import Icone from '../../ui/Icone.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Barre du haut des vues Carte et Liste :
// champ de recherche + bouton "Filtres" + puces de cuisine (filtre en un geste).
export default function BarreRecherche({ filtres, setFiltres, nombreResultats }) {
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const { cuisines } = useDonnees()
  const nbActifs = compterFiltresActifs(filtres)

  // Une puce par cuisine ; « Tout » remet le filtre cuisine à vide.
  const puces = [{ valeur: '', texte: 'Tout' }, ...cuisines.map(({ nom }) => ({ valeur: nom, texte: nom }))]

  return (
    <div className="bg-gray-50 px-3 pt-3 pb-2">
      <div className="mx-auto flex max-w-5xl gap-2">
        <div className="relative flex-1">
          <label htmlFor="recherche" className="sr-only">
            Rechercher un restaurant (nom, ville, cuisine)
          </label>
          <input
            id="recherche"
            type="search"
            value={filtres.texte}
            onChange={(e) => setFiltres({ ...filtres, texte: e.target.value })}
            placeholder="Une envie, une ville…"
            className="min-h-12 w-full rounded-2xl border border-transparent bg-white pr-3 pl-11 text-base font-medium text-gray-900 shadow-[0_4px_16px_rgb(40_30_20/0.08)] placeholder:text-gray-500 focus:border-gray-900"
            autoComplete="off"
          />
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-600">
            <Icone nom="recherche" taille={20} />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          aria-expanded={filtresOuverts}
          aria-controls="panneau-filtres"
          aria-label={`Filtres${nbActifs ? ` (${nbActifs} actifs)` : ''}`}
          className="relative flex min-h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-[0_4px_16px_rgb(40_30_20/0.16)]"
        >
          <Icone nom={filtresOuverts ? 'fermer' : 'filtres'} taille={20} />
          {nbActifs > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-natran-400 px-1 text-xs font-bold text-gray-950">
              {nbActifs}
            </span>
          )}
        </button>
      </div>

      {/* Puces de cuisine : défilent horizontalement sur téléphone */}
      <div className="sans-barre mx-auto mt-2.5 flex max-w-5xl gap-2 overflow-x-auto pb-1" role="group" aria-label="Type de cuisine">
        {puces.map((p) => {
          const actif = filtres.cuisine === p.valeur
          return (
            <button
              key={p.texte}
              type="button"
              aria-pressed={actif}
              onClick={() => setFiltres({ ...filtres, cuisine: p.valeur })}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap shadow-[0_1px_4px_rgb(40_30_20/0.08)] ${
                actif ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-[4px]"
                style={{ background: p.valeur ? styleCuisine(p.valeur, cuisines).couleur : actif ? '#ffffff' : '#1b1a17' }}
                aria-hidden="true"
              />
              {p.texte}
            </button>
          )
        })}
      </div>

      {filtresOuverts && (
        <PanneauFiltres filtres={filtres} setFiltres={setFiltres} onFermer={() => setFiltresOuverts(false)} />
      )}

      {/* Annonce le nombre de résultats aux lecteurs d'écran à chaque changement */}
      <p className="mx-auto mt-1 max-w-5xl text-sm text-gray-600" aria-live="polite">
        {nombreResultats} adresse{nombreResultats > 1 ? 's' : ''} validée{nombreResultats > 1 ? 's' : ''} par les collègues
      </p>
    </div>
  )
}
