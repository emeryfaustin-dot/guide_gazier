import { NavigationHaut } from './Navigation.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Bandeau du haut : titre de l'app, badge "Démo" si besoin, navigation (grand écran).
export default function EnTete({ pageActive }) {
  const { service } = useDonnees()
  return (
    <header className="flex items-center justify-between gap-3 bg-blue-800 px-4 py-2 text-white shadow">
      <a href="#/" className="flex min-h-11 items-center gap-2 text-lg font-bold">
        <span aria-hidden="true">🍽️</span>Guide du gazier
        {service.mode === 'demo' && (
          <span className="rounded bg-amber-300 px-2 py-0.5 text-xs font-bold text-amber-950">DÉMO</span>
        )}
      </a>
      <NavigationHaut pageActive={pageActive} />
    </header>
  )
}
