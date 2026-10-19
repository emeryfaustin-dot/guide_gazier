import { useState } from 'react'
import { CUISINES } from '../../config/cuisines.js'
import { VignetteCuisine } from '../../ui/Icone.jsx'

// Légende repliable, en bas à gauche de la carte : une couleur par cuisine
// + la pastille « ! » des restaurants hors budget.
// z-[1000] : place la légende AU-DESSUS de la carte (Leaflet utilise des z-index élevés).
export default function Legende() {
  const [ouverte, setOuverte] = useState(false)

  return (
    <div className="absolute bottom-6 left-3 z-[1000] rounded-2xl bg-white/95 text-sm shadow-[0_6px_20px_rgb(40_30_20/0.14)] backdrop-blur">
      <button
        type="button"
        onClick={() => setOuverte(!ouverte)}
        aria-expanded={ouverte}
        aria-controls="legende-carte"
        className="flex min-h-11 items-center gap-2 px-3 font-semibold text-gray-900"
      >
        <span className="flex -space-x-1" aria-hidden="true">
          {CUISINES.slice(0, 4).map((c) => (
            <VignetteCuisine key={c} cuisine={c} taille={18} arrondi={6} />
          ))}
        </span>
        Légende
      </button>

      {ouverte && (
        <ul id="legende-carte" className="space-y-1.5 px-3 pb-3">
          {CUISINES.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <VignetteCuisine cuisine={c} taille={22} arrondi={7} />
              {c}
            </li>
          ))}
          <li className="flex items-center gap-2 border-t border-gray-200 pt-2">
            <span
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-hors bg-hors-fond text-xs font-bold text-hors"
              aria-hidden="true"
            >
              !
            </span>
            Hors budget
          </li>
        </ul>
      )}
    </div>
  )
}
