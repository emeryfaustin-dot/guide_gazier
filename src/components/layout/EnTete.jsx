import { NavigationHaut } from './Navigation.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { STYLES_CUISINES } from '../../config/cuisines.js'

// Bandeau du haut : nom de l'app, badge "Démo" si besoin, navigation (grand écran).
export default function EnTete({ pageActive }) {
  const { service } = useDonnees()
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-1.5">
      <a href="#/" className="flex min-h-11 items-center gap-2.5 text-gray-900">
        {/* Logo : des couverts blancs sur un carré tomate */}
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-tomate-600 text-white" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {STYLES_CUISINES.Autre.traits.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </span>
        <span className="font-display text-xl font-extrabold tracking-tight">
          Guide du <span className="text-tomate-600">gazier</span>
        </span>
        {service.mode === 'demo' && (
          <span className="rounded-md bg-hors-fond px-2 py-0.5 text-xs font-bold text-hors">DÉMO</span>
        )}
      </a>
      <NavigationHaut pageActive={pageActive} />
    </header>
  )
}
