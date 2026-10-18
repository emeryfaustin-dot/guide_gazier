import { Marker, Popup } from 'react-leaflet'
import FicheResumee from './FicheResumee.jsx'
import { iconeValide, iconeHorsBudget } from './iconeMarqueur.js'
import { estDansLeBudget } from '../../utils/budget.js'

// Un marqueur = un restaurant sur la carte.
// Au clic, Leaflet ouvre une "Popup" contenant la fiche résumée.
export default function MarqueurRestaurant({ restaurant, plafonds, stats }) {
  const valide = estDansLeBudget(restaurant, plafonds)

  return (
    <Marker
      position={[restaurant.lat, restaurant.lng]}
      icon={valide ? iconeValide : iconeHorsBudget}
      // Texte lu par les lecteurs d'écran et affiché au survol
      title={`${restaurant.nom} – ${valide ? 'dans le budget' : 'hors budget'}`}
      alt={restaurant.nom}
    >
      <Popup>
        <FicheResumee restaurant={restaurant} plafonds={plafonds} stats={stats} />
      </Popup>
    </Marker>
  )
}
