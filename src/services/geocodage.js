// Géocodage GRATUIT avec Nominatim (OpenStreetMap) pour la saisie manuelle :
// transforme une adresse en coordonnées GPS (lat, lng).
// Règles d'usage Nominatim : 1 requête par seconde maximum, pas d'usage massif.
// On ne l'appelle que sur clic du bouton "Localiser", donc c'est respecté.

export async function localiserAdresse({ adresse, codePostal, ville }) {
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    countrycodes: 'fr',
    street: adresse,
    postalcode: codePostal,
    city: ville,
  })
  const reponse = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'fr' },
  })
  if (!reponse.ok) throw new Error('Service de localisation indisponible.')
  const resultats = await reponse.json()
  if (!resultats.length) throw new Error('Adresse introuvable. Vérifie la rue, le code postal et la ville.')
  return { lat: Number(resultats[0].lat), lng: Number(resultats[0].lon) }
}
