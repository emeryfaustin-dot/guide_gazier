// Légende posée en bas à gauche de la carte : explique les deux couleurs de marqueurs.
// z-[1000] : place la légende AU-DESSUS de la carte (Leaflet utilise des z-index élevés).

export default function Legende() {
  return (
    <div className="absolute bottom-6 left-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-sm shadow-md">
      <ul className="space-y-1">
        <li className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white" aria-hidden="true">
            ✓
          </span>
          Validé (dans le budget)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white" aria-hidden="true">
            !
          </span>
          Hors budget
        </li>
      </ul>
    </div>
  )
}
