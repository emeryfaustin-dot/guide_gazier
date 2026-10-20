import { NavigationHaut } from './Navigation.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Bandeau du haut : logo (sans titre), badge "Démo" si besoin, navigation (grand écran).
export default function EnTete({ pageActive }) {
  const { service } = useDonnees()
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-1.5">
      <a href="#/" className="flex min-h-11 items-center gap-2.5 text-gray-900">
        {/* Logo seul : le texte alternatif garde le nom de l'app pour les lecteurs d'écran */}
        <img src="/logo.png" alt="Guide du gazier – accueil" width="44" height="44" className="h-11 w-11" />
        {service.mode === 'demo' && (
          <span className="rounded-md bg-hors-fond px-2 py-0.5 text-xs font-bold text-hors">DÉMO</span>
        )}
      </a>
      <NavigationHaut pageActive={pageActive} />
    </header>
  )
}
