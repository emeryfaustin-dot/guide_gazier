import { useMemo } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'
import BarreRecherche from '../components/recherche/BarreRecherche.jsx'
import Carte from '../components/carte/Carte.jsx'
import Legende from '../components/carte/Legende.jsx'
import ListeRestaurants from '../components/liste/ListeRestaurants.jsx'
import { filtrerRestaurants } from '../utils/filtres.js'

// Vue principale : barre de recherche + carte OU liste des restaurants filtrés.
// Seuls les restaurants "publiés" (statut valide) apparaissent ici.
export default function VueRestaurants({ vue, filtres, setFiltres }) {
  const { restaurants, plafonds, stats, favoris } = useDonnees()

  // useMemo : on ne refiltre que si une donnée utile a changé.
  const affiches = useMemo(
    () =>
      filtrerRestaurants(
        restaurants.filter((r) => r.statut === 'valide'),
        filtres,
        { plafonds, stats, favoris },
      ),
    [restaurants, filtres, plafonds, stats, favoris],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BarreRecherche filtres={filtres} setFiltres={setFiltres} nombreResultats={affiches.length} />

      {vue === 'carte' ? (
        <div className="relative min-h-0 flex-1">
          <Carte restaurants={affiches} plafonds={plafonds} stats={stats} />
          <Legende />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ListeRestaurants restaurants={affiches} plafonds={plafonds} stats={stats} favoris={favoris} />
        </div>
      )}
    </div>
  )
}
