import { useCallback, useState } from 'react'
import { FournisseurDonnees, useDonnees } from './contexte/DonneesContexte.jsx'
import { aller, useRoute } from './hooks/useRoute.js'
import { FILTRES_PAR_DEFAUT } from './utils/filtres.js'
import EnTete from './components/layout/EnTete.jsx'
import { NavigationBas } from './components/layout/Navigation.jsx'
import FicheRestaurant from './components/fiche/FicheRestaurant.jsx'
import VueRestaurants from './pages/VueRestaurants.jsx'
import PageConnexion from './pages/PageConnexion.jsx'
import PageProfil from './pages/PageProfil.jsx'
import PageAjout from './pages/PageAjout.jsx'
import PageAdmin from './pages/PageAdmin.jsx'
import PageRoulette from './pages/PageRoulette.jsx'
import Notification from './ui/Notification.jsx'
import Message from './ui/Message.jsx'

// Racine de l'app : on "enveloppe" tout dans le fournisseur de données.
export default function App() {
  return (
    <FournisseurDonnees>
      <Application />
    </FournisseurDonnees>
  )
}

function Application() {
  const { utilisateur, sessionVerifiee, erreur, recharger } = useDonnees()
  const { page, id, derniereVue } = useRoute()
  // Les filtres sont gardés ici pour être conservés entre Carte et Liste.
  const [filtres, setFiltres] = useState(FILTRES_PAR_DEFAUT)
  const fermerFiche = useCallback(() => aller(derniereVue === 'liste' ? '/liste' : '/'), [derniereVue])

  if (!sessionVerifiee) {
    return <p className="flex h-dvh items-center justify-center text-gray-700">Chargement…</p>
  }
  if (!utilisateur) return <PageConnexion />

  const pageAffichee = page

  return (
    <div className="flex h-dvh flex-col">
      <EnTete pageActive={pageAffichee === 'restaurant' ? derniereVue : pageAffichee} />

      {erreur && (
        <div className="p-3">
          <Message type="erreur">
            Impossible de charger les données : {erreur}{' '}
            <button type="button" className="font-semibold underline" onClick={recharger}>
              Réessayer
            </button>
          </Message>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {(pageAffichee === 'carte' || pageAffichee === 'liste' || pageAffichee === 'restaurant') && (
          <VueRestaurants vue={pageAffichee === 'restaurant' ? derniereVue : pageAffichee} filtres={filtres} setFiltres={setFiltres} />
        )}
        {pageAffichee === 'ajouter' && <PageAjout />}
        {pageAffichee === 'admin' && <PageAdmin />}
        {pageAffichee === 'roulette' && <PageRoulette />}
        {pageAffichee === 'profil' && <PageProfil key={utilisateur.prenom} />}
        {!['carte', 'liste', 'restaurant', 'ajouter', 'admin', 'roulette', 'profil'].includes(pageAffichee) && (
          <main className="p-4">
            <Message type="alerte">
              Page introuvable. <a href="#/" className="font-semibold underline">Retour à la carte</a>
            </Message>
          </main>
        )}
      </div>

      <NavigationBas pageActive={pageAffichee === 'restaurant' ? derniereVue : pageAffichee} />

      {pageAffichee === 'restaurant' && <FicheRestaurant restaurantId={id} onFermer={fermerFiche} />}

      <Notification />
    </div>
  )
}
