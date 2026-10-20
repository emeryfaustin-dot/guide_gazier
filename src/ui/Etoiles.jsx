// Affichage d'une note en étoiles, ex. 4 → ★★★★☆
// Le texte "4 sur 5" est lu par les lecteurs d'écran à la place des symboles.

export function EtoilesAffichage({ note }) {
  // On n'affiche une étoile pleine qu'à partir de x,5 « au-dessus » : 4,5 → 4 étoiles, 4,6 → 5.
  const arrondie = Math.min(5, Math.floor(note + 0.49))
  return (
    <span className="text-etoile" aria-label={`${note} sur 5`} role="img">
      {'★'.repeat(arrondie)}
      <span className="text-gray-300">{'★'.repeat(5 - arrondie)}</span>
    </span>
  )
}

// Choix d'une note de 1 à 5 : de vrais boutons radio (accessibles au clavier),
// stylés en grandes étoiles faciles à toucher.
export function EtoilesSaisie({ valeur, onChange, nom = 'note' }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-gray-800">Ta note</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name={nom}
              value={n}
              checked={valeur === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-3xl peer-focus-visible:outline-3 peer-focus-visible:outline-natran-700 ${
                n <= valeur ? 'text-etoile' : 'text-gray-300'
              }`}
              aria-hidden="true"
            >
              ★
            </span>
            <span className="sr-only">
              {n} étoile{n > 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
