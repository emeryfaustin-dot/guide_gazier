import { useState } from 'react'
import PanneauFiltres from './PanneauFiltres.jsx'
import { compterFiltresActifs } from '../../utils/filtres.js'
import { champ } from '../../ui/styles.js'

// Barre du haut des vues Carte et Liste :
// champ de recherche + bouton "Filtres" qui ouvre le panneau des filtres.
export default function BarreRecherche({ filtres, setFiltres, nombreResultats }) {
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const nbActifs = compterFiltresActifs(filtres)

  return (
    <div className="border-b border-gray-200 bg-white px-3 py-2 shadow-sm">
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
            placeholder="Nom, ville, cuisine…"
            className={`${champ} pl-9`}
            autoComplete="off"
          />
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" aria-hidden="true">
            🔍
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          aria-expanded={filtresOuverts}
          aria-controls="panneau-filtres"
          className={`min-h-11 shrink-0 rounded-lg border px-3 font-semibold ${
            nbActifs ? 'border-blue-800 bg-blue-800 text-white' : 'border-gray-400 bg-white text-gray-800'
          }`}
        >
          Filtres{nbActifs ? ` (${nbActifs})` : ''}
        </button>
      </div>

      {filtresOuverts && (
        <PanneauFiltres filtres={filtres} setFiltres={setFiltres} onFermer={() => setFiltresOuverts(false)} />
      )}

      {/* Annonce le nombre de résultats aux lecteurs d'écran à chaque changement */}
      <p className="mx-auto mt-1 max-w-5xl text-sm text-gray-700" aria-live="polite">
        {nombreResultats} restaurant{nombreResultats > 1 ? 's' : ''} trouvé{nombreResultats > 1 ? 's' : ''}
      </p>
    </div>
  )
}
