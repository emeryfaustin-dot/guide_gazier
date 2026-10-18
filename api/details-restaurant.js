// GET /api/details-restaurant?placeId=<identifiant Google>
// Relit EN DIRECT chez Google : téléphone, horaires, site web, photo.
// Ces infos ne sont pas copiées dans notre base (conditions d'utilisation Google) :
// on ne conserve que le place_id et on rafraîchit à chaque ouverture de fiche.

import { repondre, parametre, verifierUtilisateur, cleGoogle } from './_outils.js'

const CHAMPS = [
  'id',
  'nationalPhoneNumber',
  'regularOpeningHours.weekdayDescriptions',
  'websiteUri',
  'googleMapsUri',
  'photos',
].join(',')

export default async function handler(req, res) {
  try {
    if (!(await verifierUtilisateur(req))) return repondre(res, 401, { erreur: 'Connexion requise.' })

    const cle = cleGoogle()
    if (!cle) return repondre(res, 503, { erreur: 'Clé Google Places non configurée sur le serveur.' })

    const placeId = parametre(req, 'placeId') || ''
    // Un place_id ne contient que lettres, chiffres, "-" et "_" : on refuse le reste.
    if (!/^[\w-]{10,300}$/.test(placeId)) return repondre(res, 400, { erreur: 'Identifiant invalide.' })

    const reponse = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`, {
      headers: { 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS },
    })
    if (!reponse.ok) {
      console.error('Google Places (détails)', reponse.status, await reponse.text())
      return repondre(res, 502, { erreur: 'Google Places ne répond pas correctement.' })
    }
    const lieu = await reponse.json()

    // Photo : on demande à Google une URL publique de l'image (sans exposer la clé).
    let photo = null
    const premiere = lieu.photos?.[0]
    if (premiere?.name) {
      const rep = await fetch(
        `https://places.googleapis.com/v1/${premiere.name}/media?maxWidthPx=800&skipHttpRedirect=true&key=${cle}`,
      )
      if (rep.ok) {
        const { photoUri } = await rep.json()
        photo = {
          url: photoUri,
          // Les auteurs de la photo doivent être crédités (obligation Google).
          auteurs: (premiere.authorAttributions ?? []).map((a) => ({ nom: a.displayName, lien: a.uri })),
        }
      }
    }

    return repondre(res, 200, {
      telephone: lieu.nationalPhoneNumber ?? null,
      horaires: lieu.regularOpeningHours?.weekdayDescriptions ?? [],
      siteWeb: lieu.websiteUri ?? null,
      lienGoogleMaps: lieu.googleMapsUri ?? null,
      photo,
    })
  } catch (erreur) {
    console.error(erreur)
    return repondre(res, 500, { erreur: 'Erreur interne pendant la lecture des détails.' })
  }
}
