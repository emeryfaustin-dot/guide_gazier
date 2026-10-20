import { Marker, Popup } from 'react-leaflet'
import FicheResumee from './FicheResumee.jsx'
import { iconePour } from './iconeMarqueur.js'
import { estDansLeBudget } from '../../utils/budget.js'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Un marqueur = un restaurant sur la carte.
// Le pin prend la couleur et le pictogramme de sa cuisine.
// Au clic, Leaflet ouvre une "Popup" contenant la fiche résumée.
export default function MarqueurRestaurant({ restaurant, plafonds, stats }) {
  const { cuisines } = useDonnees()
  const valide = estDansLeBudget(restaurant, plafonds)

  return (
    <Marker
      position={[restaurant.lat, restaurant.lng]}
      icon={iconePour(restaurant.cuisine, !valide, cuisines)}
      // Texte lu par les lecteurs d'écran et affiché au survol
      title={`${restaurant.nom} – ${restaurant.cuisine} – ${valide ? 'dans le budget' : 'hors budget'}`}
      alt={restaurant.nom}
    >
      <Popup>
        <FicheResumee restaurant={restaurant} plafonds={plafonds} stats={stats} />
      </Popup>
    </Marker>
  )
}
