import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Liens de navigation principaux. Affichés :
//  - en barre fixe en BAS de l'écran sur téléphone (facile à atteindre avec le pouce)
//  - dans l'en-tête sur grand écran
function liens(estAdmin) {
  return [
    { page: 'carte', href: '#/', icone: '🗺️', texte: 'Carte' },
    { page: 'liste', href: '#/liste', icone: '📋', texte: 'Liste' },
    { page: 'ajouter', href: '#/ajouter', icone: '➕', texte: 'Ajouter' },
    ...(estAdmin ? [{ page: 'admin', href: '#/admin', icone: '🛠️', texte: 'Admin' }] : []),
    { page: 'profil', href: '#/profil', icone: '👤', texte: 'Profil' },
  ]
}

export function NavigationBas({ pageActive }) {
  const { utilisateur } = useDonnees()
  return (
    <nav aria-label="Navigation principale" className="border-t border-gray-200 bg-white md:hidden">
      <ul className="flex">
        {liens(utilisateur?.role === 'admin').map((l) => (
          <li key={l.page} className="flex-1">
            <a
              href={l.href}
              aria-current={pageActive === l.page ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center text-xs font-semibold ${
                pageActive === l.page ? 'text-blue-800' : 'text-gray-700'
              }`}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {l.icone}
              </span>
              {l.texte}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function NavigationHaut({ pageActive }) {
  const { utilisateur } = useDonnees()
  return (
    <nav aria-label="Navigation principale" className="hidden md:block">
      <ul className="flex gap-1">
        {liens(utilisateur?.role === 'admin').map((l) => (
          <li key={l.page}>
            <a
              href={l.href}
              aria-current={pageActive === l.page ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 font-semibold ${
                pageActive === l.page ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-700'
              }`}
            >
              {l.texte}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
