// GET /api/rechercher-restaurant?q=<nom du restaurant OU lien Google Maps>
// Renvoie jusqu'à 5 restaurants trouvés par Google Places (Text Search).
//
// Coût : on ne demande QUE les champs utiles (FieldMask) → facturé en "Text Search Pro".

import { repondre, parametre, verifierUtilisateur, cleGoogle } from './_outils.js'

// Seuls ces sites peuvent être "suivis" quand on colle un lien (sécurité).
const HOTES_AUTORISES = /(^|\.)((maps\.app\.goo\.gl)|(goo\.gl)|(google\.[a-z.]+))$/i

const CHAMPS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
].join(',')

/** Transforme un lien Google Maps en { texte, lat, lng, placeId } exploitable. */
export async function analyserLien(lien) {
  let url
  try {
    url = new URL(lien)
  } catch {
    return null
  }
  if (!HOTES_AUTORISES.test(url.hostname)) return null

  // Les liens courts (maps.app.goo.gl/...) redirigent vers le lien complet : on le suit.
  if (/goo\.gl$/i.test(url.hostname)) {
    const reponse = await fetch(url, { redirect: 'follow' })
    url = new URL(reponse.url)
    if (!HOTES_AUTORISES.test(url.hostname)) return null
  }

  const complet = decodeURIComponent(url.href)
  const nomLieu = complet.match(/\/maps\/place\/([^/]+)/)?.[1]?.replace(/\+/g, ' ')
  // !3d<lat>!4d<lng> = position exacte du lieu ; @lat,lng = centre de la carte
  const exact = complet.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  const centre = complet.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  const coords = exact || centre

  return {
    texte: nomLieu || url.searchParams.get('q') || url.searchParams.get('query'),
    placeId: url.searchParams.get('query_place_id'),
    lat: coords ? Number(coords[1]) : null,
    lng: coords ? Number(coords[2]) : null,
  }
}

/** Extrait ville / code postal / rue des "addressComponents" de Google. */
export function analyserAdresse(composants = [], adresseComplete = '') {
  const trouver = (type) => composants.find((c) => c.types?.includes(type))?.longText ?? ''
  const rue = [trouver('street_number'), trouver('route')].filter(Boolean).join(' ')
  return {
    adresse: rue || adresseComplete.split(',')[0] || '',
    ville: trouver('locality') || trouver('postal_town') || trouver('administrative_area_level_2'),
    codePostal: trouver('postal_code'),
  }
}

export default async function handler(req, res) {
  try {
    if (!(await verifierUtilisateur(req))) return repondre(res, 401, { erreur: 'Connexion requise.' })

    const cle = cleGoogle()
    if (!cle) return repondre(res, 503, { erreur: 'Clé Google Places non configurée sur le serveur.' })

    const q = (parametre(req, 'q') || '').trim()
    if (q.length < 2 || q.length > 500) return repondre(res, 400, { erreur: 'Recherche trop courte.' })

    // Lien Google Maps ou simple texte ?
    let texte = q
    let biais = null
    if (/^https?:\/\//i.test(q)) {
      const lien = await analyserLien(q)
      if (!lien?.texte) return repondre(res, 400, { erreur: 'Lien Google Maps non reconnu. Essaie avec le nom du restaurant.' })
      texte = lien.texte
      if (lien.lat != null) biais = { circle: { center: { latitude: lien.lat, longitude: lien.lng }, radius: 500 } }
    }

    const reponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': cle,
        'X-Goog-FieldMask': CHAMPS,
      },
      body: JSON.stringify({
        textQuery: texte,
        languageCode: 'fr',
        regionCode: 'FR',
        pageSize: 5,
        ...(biais ? { locationBias: biais } : {}),
      }),
    })

    if (!reponse.ok) {
      console.error('Google Places (recherche)', reponse.status, await reponse.text())
      return repondre(res, 502, { erreur: 'Google Places ne répond pas correctement.' })
    }

    const { places = [] } = await reponse.json()
    const resultats = places.map((p) => ({
      placeId: p.id,
      nom: p.displayName?.text ?? '',
      adresseComplete: p.formattedAddress ?? '',
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      ...analyserAdresse(p.addressComponents, p.formattedAddress),
    }))

    return repondre(res, 200, { resultats })
  } catch (erreur) {
    console.error(erreur)
    return repondre(res, 500, { erreur: 'Erreur interne pendant la recherche.' })
  }
}
