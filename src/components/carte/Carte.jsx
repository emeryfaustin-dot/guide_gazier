import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarqueurRestaurant from './MarqueurRestaurant.jsx'

// Centre par défaut (Île-de-France / Oise) si aucun restaurant n'est affiché.
const CENTRE_PAR_DEFAUT = [48.95, 2.45]

// La carte interactive.
// - MapContainer : le cadre de la carte (zoom, déplacement au doigt)
// - TileLayer    : les "tuiles" d'images OpenStreetMap (gratuites)
// - un MarqueurRestaurant par restaurant
export default function Carte({ restaurants, plafonds, stats }) {
  return (
    <MapContainer
      center={CENTRE_PAR_DEFAUT}
      zoom={9}
      zoomSnap={0.5} // autorise les demi-niveaux de zoom : cadrage plus précis
      className="h-full w-full"
      aria-label="Carte des restaurants"
    >
      <TileLayer
        // Mention obligatoire selon la licence OpenStreetMap
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AjusterVue restaurants={restaurants} />

      {restaurants.map((restaurant) => (
        // "key" aide React à suivre chaque élément d'une liste
        <MarqueurRestaurant key={restaurant.id} restaurant={restaurant} plafonds={plafonds} stats={stats[restaurant.id]} />
      ))}
    </MapContainer>
  )
}

// Recadre automatiquement la carte sur les restaurants affichés
// à chaque fois que la liste change (recherche, filtres…).
function AjusterVue({ restaurants }) {
  const carte = useMap()
  // On compare une "signature" des ids pour ne recadrer que si la liste a vraiment changé.
  const signature = restaurants.map((r) => r.id).join(',')

  useEffect(() => {
    if (!restaurants.length) return
    if (restaurants.length === 1) {
      carte.setView([restaurants[0].lat, restaurants[0].lng], 14, { animate: false })
    } else {
      carte.fitBounds(
        restaurants.map((r) => [r.lat, r.lng]),
        // animate: false évite une erreur Leaflet si on quitte la carte pendant l'animation
        { padding: [50, 50], maxZoom: 14, animate: false },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, carte])

  return null
}
