import { useEffect, useRef } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { useDetailsGoogle } from '../../hooks/useDetailsGoogle.js'
import BadgeBudget from '../../ui/BadgeBudget.jsx'
import { EtoilesAffichage } from '../../ui/Etoiles.jsx'
import Message from '../../ui/Message.jsx'
import BoutonFavori from './BoutonFavori.jsx'
import SectionAvis from './SectionAvis.jsx'
import { bouton } from '../../ui/styles.js'
import { formaterNote } from '../../utils/notes.js'

// Fiche complète d'un restaurant.
// Sur téléphone : plein écran. Sur grand écran : panneau à droite.
// C'est une "boîte de dialogue" accessible : titre annoncé, touche Échap pour fermer.
export default function FicheRestaurant({ restaurantId, onFermer }) {
  const { restaurants, plafonds, stats, chargement } = useDonnees()
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

  return (
    <div className="fixed inset-0 z-[1500] flex justify-end bg-black/40" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-fiche"
        className="h-full w-full overflow-y-auto bg-white shadow-2xl md:max-w-xl"
        onClick={(e) => e.stopPropagation()} // un clic DANS la fiche ne la ferme pas
      >
        {/* Barre du haut collante : reste visible quand on fait défiler */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2">
          <button type="button" onClick={onFermer} className={bouton.secondaire}>
            <span aria-hidden="true">←</span> Retour
          </button>
          {restaurant && <BoutonFavori restaurantId={restaurant.id} />}
        </div>

        {!restaurant ? (
          <div className="p-4">
            <h1 id="titre-fiche" ref={titreRef} tabIndex={-1} className="mb-3 text-xl font-bold">
              {chargement ? 'Chargement…' : 'Restaurant introuvable'}
            </h1>
            {!chargement && <Message type="alerte">Ce restaurant n’existe pas ou n’est plus disponible.</Message>}
          </div>
        ) : (
          <div className="space-y-6 p-4 pb-24">
            {details?.photo && <PhotoGoogle photo={details.photo} nom={restaurant.nom} />}

            <header className="space-y-2">
              {restaurant.statut !== 'valide' && (
                <Message type="info">Proposition en attente de validation par l’administrateur.</Message>
              )}
              <h1 id="titre-fiche" ref={titreRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
                {restaurant.nom}
              </h1>
              <p className="text-gray-700">
                {restaurant.cuisine} · {restaurant.ville} ({restaurant.departement})
              </p>
              <p className="flex flex-wrap items-center gap-2 text-gray-900">
                {statsResto ? (
                  <>
                    <EtoilesAffichage note={statsResto.moyenne} />
                    <strong>{formaterNote(statsResto.moyenne)} / 5</strong>
                    <span className="text-gray-700">({statsResto.nombre} avis)</span>
                  </>
                ) : (
                  <span className="text-gray-700">Pas encore noté</span>
                )}
              </p>
              <p className="text-gray-900">
                Prix moyen : <strong>~{restaurant.prixMoyen} € / personne</strong>
              </p>
              <BadgeBudget restaurant={restaurant} plafonds={plafonds} />
            </header>

            <section aria-labelledby="titre-infos" className="space-y-3">
              <h2 id="titre-infos" className="text-lg font-bold text-gray-900">
                Infos pratiques
              </h2>

              <Info titre="Adresse">
                {restaurant.adresse}, {restaurant.codePostal} {restaurant.ville}
                <br />
                <a
                  className={bouton.lien}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Itinéraire
                </a>
              </Info>

              {telephone && (
                <Info titre="Téléphone">
                  <a className={bouton.lien} href={`tel:${telephone.replace(/\s/g, '')}`}>
                    {telephone}
                  </a>
                </Info>
              )}

              {horaires.length > 0 && (
                <Info titre="Horaires">
                  <ul>
                    {horaires.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </Info>
              )}

              {siteWeb && (
                <Info titre="Site web">
                  <a className={`${bouton.lien} break-all`} href={siteWeb} target="_blank" rel="noreferrer">
                    {siteWeb.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </a>
                </Info>
              )}

              {chargementGoogle && <p className="text-gray-700">Mise à jour des infos Google…</p>}
              {erreurGoogle && <p className="text-sm text-gray-700">Infos Google indisponibles : {erreurGoogle}</p>}
              {details && (
                <p className="text-sm text-gray-700">
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

            <SectionAvis restaurantId={restaurant.id} />
          </div>
        )}
      </div>
    </div>
  )
}

// Une ligne d'info : petit titre + contenu.
function Info({ titre, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700">{titre}</h3>
      <div className="text-gray-900">{children}</div>
    </div>
  )
}

// Photo Google + crédit de l'auteur (obligatoire selon les conditions Google).
function PhotoGoogle({ photo, nom }) {
  return (
    <figure className="-mx-4 -mt-4">
      <img src={photo.url} alt={`Photo du restaurant ${nom}`} className="h-56 w-full object-cover" />
      {photo.auteurs.length > 0 && (
        <figcaption className="px-4 pt-1 text-xs text-gray-700">
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
