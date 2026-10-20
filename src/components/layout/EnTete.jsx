import { NavigationHaut } from './Navigation.jsx'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Bandeau du haut (fond foncé) : logo + nom en jaune NaTran, badge "Démo" si besoin, navigation (grand écran).
export default function EnTete({ pageActive }) {
  const { service } = useDonnees()
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-800 bg-gray-900 px-4 py-1.5">
      <a href="#/" className="flex min-h-11 items-center gap-2.5 text-white">
        {/* Logo décoratif (alt vide) : le nom est écrit juste à côté */}
        <img src="/logo.png" alt="" width="44" height="44" className="h-11 w-11" />
        {/* Nom de l'app en jaune NaTran, à côté du logo */}
        <span className="font-display text-xl font-extrabold tracking-tight text-natran-400">Le guide du Gazier</span>
        {service.mode === 'demo' && (
          <span className="rounded-md bg-hors-fond px-2 py-0.5 text-xs font-bold text-hors">DÉMO</span>
        )}
      </a>
      <NavigationHaut pageActive={pageActive} />
    </header>
  )
}
