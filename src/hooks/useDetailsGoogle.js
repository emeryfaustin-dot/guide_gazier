import { useEffect, useState } from 'react'
import { detailsPlace } from '../services/places.js'

// Charge en direct les infos Google (téléphone, horaires, site, photo) d'un restaurant
// qui possède un place_id. Rien n'est stocké : c'est relu à chaque ouverture de fiche.
export function useDetailsGoogle(placeId) {
  // On mémorise POUR QUEL placeId on a une réponse : si ce n'est pas le bon, c'est que ça charge.
  const [resultat, setResultat] = useState({ placeId: null, details: null, erreur: null })

  useEffect(() => {
    if (!placeId) return
    let annule = false // évite de mettre à jour un composant déjà fermé
    detailsPlace(placeId)
      .then((details) => !annule && setResultat({ placeId, details, erreur: null }))
      .catch((e) => !annule && setResultat({ placeId, details: null, erreur: e.message }))
    return () => {
      annule = true
    }
  }, [placeId])

  if (!placeId) return { details: null, chargement: false, erreur: null }
  const aJour = resultat.placeId === placeId
  return {
    details: aJour ? resultat.details : null,
    erreur: aJour ? resultat.erreur : null,
    chargement: !aJour,
  }
}
