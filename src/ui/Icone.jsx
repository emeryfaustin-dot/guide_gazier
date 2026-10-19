import { styleCuisine } from '../config/cuisines.js'

// Petites icônes au trait (SVG) utilisées dans toute l'app, à la place des emojis.
// Elles prennent la couleur du texte autour (currentColor) et sont décoratives :
// le sens est toujours donné par un texte visible ou un aria-label sur le bouton.
const TRACES = {
  carte: ['M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z', 'M9 4v13', 'M15 6.5v13'],
  liste: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6v.1', 'M4 12v.1', 'M4 18v.1'],
  plus: ['M12 5v14', 'M5 12h14'],
  coeur: ['M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z'],
  profil: ['M12 12.3a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6z', 'M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3'],
  admin: ['M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z', 'M9 12l2 2 4-4'],
  recherche: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-3.5-3.5'],
  filtres: ['M4 7h10', 'M18 7h2', 'M4 17h4', 'M12 17h8', 'M16 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M10 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  retour: ['M15 5l-7 7 7 7'],
  fermer: ['M6 6l12 12', 'M18 6L6 18'],
  itineraire: ['M20 4L4 10.5l7 2.5 2.5 7z'],
  telephone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  horloge: ['M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z', 'M12 7.5V12l3 2'],
  lieu: ['M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z', 'M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z'],
  web: ['M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z', 'M3.5 12h17', 'M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z'],
  avis: ['M4 5h16v11H9l-5 4z'],
  roulette: ['M12 12h.1', 'M12 3a9 9 0 1 0 9 9', 'M12 7v5l4 2', 'M19 3v4', 'M17 5h4'],
  coche: ['M5 12.5l4.5 4.5L19 7.5'],
  alerte: ['M12 7v6', 'M12 16.5v.1'],
}

export default function Icone({ nom, taille = 22, epaisseur = 2, plein = false, className = '' }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill={plein ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {TRACES[nom].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// Étoile pleine (notes).
export function IconeEtoile({ taille = 16, className = '' }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
    </svg>
  )
}

// Vignette carrée arrondie aux couleurs d'une cuisine, avec son pictogramme.
export function VignetteCuisine({ cuisine, taille = 56, arrondi = 18 }) {
  const style = styleCuisine(cuisine)
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: taille, height: taille, borderRadius: arrondi, background: style.couleur, color: style.encre }}
      aria-hidden="true"
    >
      <svg
        width={taille * 0.48}
        height={taille * 0.48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {style.traits.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  )
}
