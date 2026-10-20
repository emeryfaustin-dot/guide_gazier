import { useEffect, useRef } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { useDetailsGoogle } from '../../hooks/useDetailsGoogle.js'
import BadgeBudget from '../../ui/BadgeBudget.jsx'
import BadgeHalal from '../../ui/BadgeHalal.jsx'
import { EtoilesAffichage } from '../../ui/Etoiles.jsx'
import Message from '../../ui/Message.jsx'
import BoutonFavori from './BoutonFavori.jsx'
import SectionAvis from './SectionAvis.jsx'
import { bouton } from '../../ui/styles.js'
import { formaterNote } from '../../utils/notes.js'
import { estDansLeBudget, trouverPlafond } from '../../utils/budget.js'
import { styleCuisine } from '../../config/cuisines.js'
import Icone, { VignetteCuisine } from '../../ui/Icone.jsx'

// Fiche complète d'un restaurant.
// Sur téléphone : plein écran. Sur grand écran : panneau à droite.
// C'est une "boîte de dialogue" accessible : titre annoncé, touche Échap pour fermer.
export default function FicheRestaurant({ restaurantId, onFermer }) {
  const { restaurants, plafonds, stats, cuisines, chargement } = useDonnees()
  const restaurant = restaurants.find((r) => String(r.id) === String(restaurantId))
  const { details, chargement: chargementGoogle, erreur: erreurGoogle } = useDetailsGoogle(restaurant?.placeId)
  const titreRef = useRef(null)

  // À l'ouverture : on place le "focus" sur le titre (utile au clavier et aux lecteurs d'écran).
  useEffect(() => {
    titreRef.current?.focus()
  }, [restaurantId])

  // Touche Échap = fermer
  useEffect(() => {
    const surTouche = (e) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer])

  // Infos de contact : celles de Google (fraîches) si dispo, sinon celles saisies à la main.
  const telephone = details?.telephone ?? restaurant?.telephone
  const siteWeb = details?.siteWeb ?? restaurant?.siteWeb
  const horaires = details?.horaires?.length ? details.horaires : restaurant?.horaires ? [restaurant.horaires] : []
  const statsResto = restaurant ? stats[restaurant.id] : null
  const style = styleCuisine(restaurant?.cuisine, cuisines)

  return (
    <div className="fixed inset-0 z-[1500] flex justify-end bg-gray-950/40" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-fiche"
        className="relative h-full w-full overflow-y-auto bg-gray-50 shadow-2xl md:max-w-xl"
        onClick={(e) => e.stopPropagation()} // un clic DANS la fiche ne la ferme pas
      >
        {/* Boutons flottants, collés en haut quand on fait défiler */}
        <div className="sticky top-0 z-10 flex h-0 items-start justify-between gap-2 px-4">
          <button
            type="button"
            onClick={onFermer}
            aria-label="Retour"
            className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-gray-900 shadow-md"
          >
            <Icone nom="retour" taille={20} epaisseur={2.2} />
          </button>
          {restaurant && (
            <div className="mt-4 rounded-xl shadow-md">
              <BoutonFavori restaurantId={restaurant.id} />
            </div>
          )}
        </div>

        {!restaurant ? (
          <div className="p-4 pt-20">
            <h1 id="titre-fiche" ref={titreRef} tabIndex={-1} className="mb-3 text-xl font-bold">
              {chargement ? 'Chargement…' : 'Restaurant introuvable'}
            </h1>
            {!chargement && <Message type="alerte">Ce restaurant n’existe pas ou n’est plus disponible.</Message>}
          </div>
        ) : (
          <>
            {details?.photo ? (
              <PhotoGoogle photo={details.photo} nom={restaurant.nom} />
            ) : (
              <BandeauCuisine cuisine={restaurant.cuisine} cuisines={cuisines} />
            )}

            <div className="relative -mt-7 space-y-6 rounded-t-[28px] bg-gray-50 px-5 pt-6 pb-24">
              <header className="space-y-2">
                {restaurant.statut !== 'valide' && (
                  <Message type="info">Proposition en attente de validation par les collègues.</Message>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1.5 text-xs font-bold tracking-wider uppercase"
                    style={{ background: style.clair, color: style.texte }}
                  >
                    <VignetteCuisine cuisine={restaurant.cuisine} cuisines={cuisines} taille={20} arrondi={7} />
                    {restaurant.cuisine}
                  </span>
                  {restaurant.halal && <BadgeHalal />}
                  <span className="text-sm text-gray-600">
                    {restaurant.ville} ({restaurant.departement})
                  </span>
                </div>
                <h1 id="titre-fiche" ref={titreRef} tabIndex={-1} className="text-3xl leading-tight font-extrabold text-gray-900">
                  {restaurant.nom}
                </h1>
                <p className="flex flex-wrap items-center gap-2 text-gray-900">
                  {statsResto ? (
                    <>
                      <EtoilesAffichage note={statsResto.moyenne} />
                      <strong>{formaterNote(statsResto.moyenne)} / 5</strong>
                      <span className="text-gray-600">· {statsResto.nombre} avis de collègues</span>
                    </>
                  ) : (
                    <span className="text-gray-600">Pas encore noté</span>
                  )}
                </p>
              </header>

              <JaugeBudget restaurant={restaurant} plafonds={plafonds} />

              {/* Les 3 actions les plus utiles sur le terrain */}
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-natran-400 text-sm font-bold text-gray-950 hover:bg-natran-500"
                >
                  <Icone nom="itineraire" taille={20} epaisseur={2.2} />Y aller
                </a>
                {telephone ? (
                  <a
                    href={`tel:${telephone.replace(/\s/g, '')}`}
                    className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 hover:bg-gray-100"
                  >
                    <Icone nom="telephone" taille={20} />Appeler
                  </a>
                ) : (
                  <span className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600">
                    <Icone nom="telephone" taille={20} />Pas de n°
                  </span>
                )}
                <a
                  href="#avis"
                  onClick={(e) => {
                    e.preventDefault() // la navigation de l'app utilise l'adresse « #/… » : on fait juste défiler
                    document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 hover:bg-gray-100"
                >
                  <Icone nom="avis" taille={20} />Donner un avis
                </a>
              </div>

              <section aria-labelledby="titre-infos" className="space-y-3 rounded-3xl bg-white p-4">
                <h2 id="titre-infos" className="text-lg font-bold text-gray-900">
                  Infos pratiques
                </h2>

                <Info icone="lieu" titre="Adresse">
                  {restaurant.adresse}, {restaurant.codePostal} {restaurant.ville}
                </Info>

                {telephone && (
                  <Info icone="telephone" titre="Téléphone">
                    <a className={bouton.lien} href={`tel:${telephone.replace(/\s/g, '')}`}>
                      {telephone}
                    </a>
                  </Info>
                )}

                {horaires.length > 0 && (
                  <Info icone="horloge" titre="Horaires">
                    <ul>
                      {horaires.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </Info>
                )}

                {siteWeb && (
                  <Info icone="web" titre="Site web">
                    <a className={`${bouton.lien} break-all`} href={siteWeb} target="_blank" rel="noreferrer">
                      {siteWeb.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </Info>
                )}

                {chargementGoogle && <p className="text-gray-600">Mise à jour des infos Google…</p>}
                {erreurGoogle && <p className="text-sm text-gray-600">Infos Google indisponibles : {erreurGoogle}</p>}
                {details && (
                  <p className="text-sm text-gray-600">
                    Infos fournies par Google
                    {details.lienGoogleMaps && (
                      <>
                        {' · '}
                        <a className={bouton.lien} href={details.lienGoogleMaps} target="_blank" rel="noreferrer">
                          Voir sur Google Maps
                        </a>
                      </>
                    )}
                  </p>
                )}
              </section>

              <div id="avis" className="scroll-mt-20">
                <SectionAvis restaurantId={restaurant.id} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Bandeau coloré aux couleurs de la cuisine, quand Google ne fournit pas de photo.
function BandeauCuisine({ cuisine, cuisines }) {
  const style = styleCuisine(cuisine, cuisines)
  return (
    <div className="relative h-52 overflow-hidden" style={{ background: style.couleur }} aria-hidden="true">
      <svg
        className="absolute -right-6 -bottom-10 opacity-20"
        width="220"
        height="220"
        viewBox="0 0 24 24"
        fill="none"
        stroke={style.encre}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {style.traits.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  )
}

// Jauge « prix moyen / plafond du département ».
function JaugeBudget({ restaurant, plafonds }) {
  const plafond = trouverPlafond(restaurant.departement, plafonds)
  const valide = estDansLeBudget(restaurant, plafonds)
  const nomDep = plafonds.find((p) => p.departement === restaurant.departement)?.nom ?? restaurant.departement

  if (plafond === null) {
    return <BadgeBudget restaurant={restaurant} plafonds={plafonds} />
  }

  const part = Math.min(100, Math.round((restaurant.prixMoyen / plafond) * 100))
  const marge = plafond - restaurant.prixMoyen

  return (
    <div className="space-y-2.5 rounded-3xl bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={`inline-flex items-center gap-1 font-bold ${valide ? 'text-ok' : 'text-hors'}`}>
          <Icone nom={valide ? 'coche' : 'alerte'} taille={16} epaisseur={2.6} />
          {valide ? 'Dans le budget' : 'Hors budget'}
        </span>
        <span className="text-sm text-gray-600">
          <strong className="font-display text-xl font-extrabold text-gray-900">~{restaurant.prixMoyen} €</strong> / {plafond} € plafond{' '}
          {nomDep}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={`${restaurant.prixMoyen} euros sur un plafond de ${plafond} euros`}
      >
        <div className={`h-full rounded-full ${valide ? 'bg-ok-vif' : 'bg-hors'}`} style={{ width: `${part}%` }} />
      </div>
      <p className="text-sm text-gray-600">
        {valide ? `Il te reste ${marge} € de marge par personne.` : `Dépasse le plafond de ${-marge} € par personne.`}
      </p>
    </div>
  )
}

// Une ligne d'info : icône + petit titre + contenu.
function Info({ icone, titre, children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-gray-600">
        <Icone nom={icone} taille={18} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-gray-600">{titre}</h3>
        <div className="text-gray-900">{children}</div>
      </div>
    </div>
  )
}

// Photo Google + crédit de l'auteur (obligatoire selon les conditions Google).
function PhotoGoogle({ photo, nom }) {
  return (
    <figure className="relative">
      <img src={photo.url} alt={`Photo du restaurant ${nom}`} className="h-60 w-full object-cover" />
      {photo.auteurs.length > 0 && (
        <figcaption className="absolute bottom-9 left-4 rounded-md bg-gray-950/60 px-2 py-0.5 text-xs text-white">
          Photo :{' '}
          {photo.auteurs.map((a, i) => (
            <span key={a.lien ?? i}>
              {i > 0 && ', '}
              <a href={a.lien} target="_blank" rel="noreferrer" className="underline">
                {a.nom}
              </a>
            </span>
          ))}{' '}
          · Google
        </figcaption>
      )}
    </figure>
  )
}
