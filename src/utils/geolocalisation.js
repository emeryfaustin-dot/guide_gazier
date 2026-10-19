const RAYON_TERRESTRE_KM = 6371

export function distanceKm(position, restaurant) {
  if (
    !Number.isFinite(position?.lat) ||
    !Number.isFinite(position?.lng) ||
    !Number.isFinite(restaurant?.lat) ||
    !Number.isFinite(restaurant?.lng)
  ) {
    return Number.POSITIVE_INFINITY
  }

  const radians = (degres) => (degres * Math.PI) / 180
  const deltaLat = radians(restaurant.lat - position.lat)
  const deltaLng = radians(restaurant.lng - position.lng)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(position.lat)) * Math.cos(radians(restaurant.lat)) * Math.sin(deltaLng / 2) ** 2

  return 2 * RAYON_TERRESTRE_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function restaurantsDansLeRayon(restaurants, position, rayonKm) {
  return restaurants
    .filter((restaurant) => restaurant.statut === 'valide')
    .map((restaurant) => ({ ...restaurant, distanceKm: distanceKm(position, restaurant) }))
    .filter((restaurant) => restaurant.distanceKm <= rayonKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}