import { useEffect, useMemo, useState } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'
import { restaurantsDansLeRayon } from '../utils/geolocalisation.js'
import { bouton, champ, etiquette } from '../ui/styles.js'
import Message from '../ui/Message.jsx'
import Icone from '../ui/Icone.jsx'

const RAYONS = [2, 5, 10, 20, 50, 100]
const COULEURS = ['#fec52e', '#245a3d', '#1d6f86', '#1d1d1b', '#7a2638', '#e6a800']

export default function PageRoulette() {
  const { restaurants } = useDonnees()
  const [rayon, setRayon] = useState(10)
  const [position, setPosition] = useState(null)
  const [localisation, setLocalisation] = useState('initiale')
  const [erreur, setErreur] = useState('')
  const [rotation, setRotation] = useState(0)
  const [tirage, setTirage] = useState(null)
  const [enCours, setEnCours] = useState(false)

  const proches = useMemo(
    () => (position ? restaurantsDansLeRayon(restaurants, position, rayon) : []),
    [position, rayon, restaurants],
  )

  useEffect(() => {
    if (!enCours) return undefined
    const minuterie = window.setTimeout(() => setEnCours(false), 2600)
    return () => window.clearTimeout(minuterie)
  }, [enCours, rotation])

  function localiser() {
    if (!navigator.geolocation) {
      setErreur('La géolocalisation n’est pas disponible sur cet appareil.')
      setLocalisation('erreur')
      return
    }
    setErreur('')
    setLocalisation('chargement')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude })
        setLocalisation('terminee')
        setTirage(null)
      },
      (cause) => {
        setErreur(
          cause.code === cause.PERMISSION_DENIED
            ? 'Autorise la localisation dans les réglages du navigateur pour lancer la roulette.'
            : 'Position introuvable. Vérifie que la localisation est activée puis réessaie.',
        )
        setLocalisation('erreur')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  function lancer() {
    if (!proches.length || enCours) return
    const index = Math.floor(Math.random() * proches.length)
    const angleCentre = ((index + 0.5) / proches.length) * 360
    const angleFinal = (360 - angleCentre + 360) % 360
    setTirage(proches[index])
    setRotation((valeur) => valeur + 5 * 360 + angleFinal)
    setEnCours(true)
  }

  const tranches = proches
    .map((restaurant, index) => `${COULEURS[index % COULEURS.length]} ${(index / proches.length) * 100}% ${((index + 1) / proches.length) * 100}%`)
    .join(', ')
  const texteLocalisation = {
    initiale: 'Ta position reste sur cet appareil.',
    chargement: 'Recherche de ta position…',
    terminee: 'Position trouvée. Les distances sont calculées à vol d’oiseau.',
    erreur: 'La localisation n’a pas abouti.',
  }[localisation]

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 overflow-y-auto p-5 pb-28 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] md:items-center md:px-8 md:py-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-natran-700">Une bonne adresse, au hasard</p>
          <h1 className="font-display text-4xl font-extrabold text-gray-950">La roulette du déjeuner</h1>
          <p className="max-w-xl text-gray-700">Laisse le sort choisir parmi les restaurants validés autour de toi.</p>
        </div>

        <div className="grid gap-4 border-y border-gray-300 py-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="rayon" className={etiquette}>Distance maximale</label>
            <select
              id="rayon"
              value={rayon}
              onChange={(e) => {
                setRayon(Number(e.target.value))
                setTirage(null)
              }}
              className={champ}
            >
              {RAYONS.map((valeur) => <option key={valeur} value={valeur}>{valeur} km</option>)}
            </select>
          </div>
          <button type="button" className={bouton.secondaire} onClick={localiser} disabled={localisation === 'chargement'}>
            <Icone nom="lieu" taille={18} />
            {localisation === 'chargement' ? 'Localisation…' : position ? 'Actualiser ma position' : 'Me localiser'}
          </button>
        </div>

        <p className="text-sm text-gray-700" aria-live="polite">{texteLocalisation}</p>
        {erreur && <Message type="erreur">{erreur}</Message>}
        {position && (
          <p className="text-sm font-semibold text-gray-800" aria-live="polite">
            {proches.length ? `${proches.length} restaurant${proches.length > 1 ? 's' : ''} dans un rayon de ${rayon} km` : `Aucun restaurant validé dans un rayon de ${rayon} km.`}
          </p>
        )}

        <button type="button" className={`${bouton.principal} min-h-14 w-full justify-center text-base`} onClick={lancer} disabled={!position || !proches.length || enCours}>
          <Icone nom="roulette" taille={21} />
          {enCours ? 'La roulette tourne…' : 'Lancer le tirage'}
        </button>
      </section>

      <section className="flex min-h-80 flex-col items-center justify-center gap-6" aria-label="Résultat du tirage">
        <div className="relative flex aspect-square w-full max-w-[20rem] items-center justify-center">
          <span className="absolute -top-1 z-10 border-x-[14px] border-t-[25px] border-x-transparent border-t-gray-950 drop-shadow" aria-hidden="true" />
          <div
            className={`relative flex aspect-square w-full items-center justify-center rounded-full border-[10px] border-white shadow-[0_16px_45px_rgb(27_26_23/0.18)] ${enCours ? 'transition-transform duration-[2600ms] [transition-timing-function:cubic-bezier(.12,.72,.08,1)]' : ''}`}
            style={{ background: proches.length ? `conic-gradient(${tranches})` : 'repeating-conic-gradient(#e2e2de 0deg 15deg, #f6f6f4 15deg 30deg)', transform: `rotate(${rotation}deg)` }}
            aria-hidden="true"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-950 text-white shadow-lg">
              <Icone nom="roulette" taille={34} />
            </span>
          </div>
        </div>
        <div className="min-h-24 text-center" aria-live="polite" aria-atomic="true">
          {tirage && !enCours ? (
            <>
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-ok">C’est décidé</p>
              <a href={`#/restaurant/${tirage.id}`} className="mt-1 block font-display text-2xl font-extrabold text-gray-950 underline decoration-natran-400 decoration-2 underline-offset-4">
                {tirage.nom}
              </a>
              <p className="mt-1 text-gray-700">{tirage.ville} · {tirage.distanceKm.toFixed(1).replace('.', ',')} km</p>
            </>
          ) : enCours ? (
            <p className="font-display text-xl font-bold text-gray-800">Le hasard choisit…</p>
          ) : (
            <p className="text-gray-600">{position ? 'Appuie pour découvrir où déjeuner.' : 'Active ta position pour commencer.'}</p>
          )}
        </div>
      </section>
    </main>
  )
}
