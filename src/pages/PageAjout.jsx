import { useState } from 'react'
import RechercheGoogle from '../components/ajout/RechercheGoogle.jsx'
import FormulaireRestaurant from '../components/ajout/FormulaireRestaurant.jsx'
import Message from '../ui/Message.jsx'
import { aller } from '../hooks/useRoute.js'
import { bouton } from '../ui/styles.js'

// Page "Ajouter un restaurant", en 2 étapes :
//  1. recherche Google (ou bascule vers la saisie manuelle)
//  2. formulaire de vérification + contrôle du budget
export default function PageAjout() {
  // etape : 'recherche' | 'formulaire' | 'termine'
  const [etape, setEtape] = useState('recherche')
  const [initial, setInitial] = useState(null)
  const [ajoute, setAjoute] = useState(null)

  return (
    <main className="mx-auto max-w-lg space-y-5 p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Ajouter un restaurant</h1>

      {etape === 'recherche' && (
        <RechercheGoogle
          onChoisir={(resultat) => {
            setInitial(resultat)
            setEtape('formulaire')
          }}
          onManuel={() => {
            setInitial(null)
            setEtape('formulaire')
          }}
        />
      )}

      {etape === 'formulaire' && (
        <FormulaireRestaurant
          initial={initial}
          onRetour={() => setEtape('recherche')}
          onAjoute={(r) => {
            setAjoute(r)
            setEtape('termine')
          }}
        />
      )}

      {etape === 'termine' && ajoute && (
        <div className="space-y-4">
          <Message type="succes">
            {ajoute.statut === 'valide' ? (
              <p>
                <strong>{ajoute.nom}</strong> est publié sur la carte.
              </p>
            ) : (
              <p>
                <strong>{ajoute.nom}</strong> a été proposé. Il apparaîtra sur la carte dès qu’un collègue l’aura validé.
              </p>
            )}
          </Message>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={bouton.principal} onClick={() => aller(`/restaurant/${ajoute.id}`)}>
              Voir la fiche
            </button>
            {ajoute.statut === 'en_attente' && (
              <button type="button" className={bouton.secondaire} onClick={() => aller('/admin')}>
                Voir les propositions
              </button>
            )}
            <button
              type="button"
              className={bouton.secondaire}
              onClick={() => {
                setInitial(null)
                setAjoute(null)
                setEtape('recherche')
              }}
            >
              Ajouter un autre restaurant
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
