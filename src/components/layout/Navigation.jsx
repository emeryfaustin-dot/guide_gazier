import Icone from '../../ui/Icone.jsx'

// Liens de navigation principaux. Affichés :
//  - en barre fixe en BAS de l'écran sur téléphone (facile à atteindre avec le pouce),
//    avec le bouton « Ajouter » mis en avant au centre
//  - dans l'en-tête sur grand écran
function liens() {
  return [
    { page: 'carte', href: '#/', icone: 'carte', texte: 'Carte' },
    { page: 'liste', href: '#/liste', icone: 'liste', texte: 'Liste' },
    { page: 'ajouter', href: '#/ajouter', icone: 'plus', texte: 'Ajouter', central: true },
    { page: 'roulette', href: '#/roulette', icone: 'roulette', texte: 'Roulette' },
    { page: 'admin', href: '#/admin', icone: 'filtres', texte: 'Réglages' },
    { page: 'profil', href: '#/profil', icone: 'profil', texte: 'Profil' },
  ]
}

export function NavigationBas({ pageActive }) {
  return (
    <nav aria-label="Navigation principale" className="border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-end">
        {liens().map((l) => {
          const actif = pageActive === l.page
          if (l.central) {
            return (
              <li key={l.page} className="flex flex-1 justify-center">
                <a
                  href={l.href}
                  aria-current={actif ? 'page' : undefined}
                  className="-mt-5 mb-1.5 flex flex-col items-center gap-1 text-xs font-bold text-gray-900"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gray-900 text-white shadow-[0_8px_18px_rgb(27_26_23/0.3)]">
                    <Icone nom="plus" taille={24} epaisseur={2.4} />
                  </span>
                  {l.texte}
                </a>
              </li>
            )
          }
          return (
            <li key={l.page} className="flex-1">
              <a
                href={l.href}
                aria-current={actif ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
                  actif ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'
                }`}
              >
                <span className={actif ? 'text-tomate-600' : ''}>
                  <Icone nom={l.icone} taille={24} epaisseur={actif ? 2.3 : 2} />
                </span>
                {l.texte}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function NavigationHaut({ pageActive }) {
  return (
    <nav aria-label="Navigation principale" className="hidden md:block">
      <ul className="flex gap-1">
        {liens().map((l) => (
          <li key={l.page}>
            <a
              href={l.href}
              aria-current={pageActive === l.page ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold ${
                pageActive === l.page ? 'bg-gray-900 text-white' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icone nom={l.icone} taille={18} />
              {l.texte}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
