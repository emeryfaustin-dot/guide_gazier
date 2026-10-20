import { useState } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'
import Propositions from '../components/admin/Propositions.jsx'
import GestionPlafonds from '../components/admin/GestionPlafonds.jsx'
import GestionRestaurants from '../components/admin/GestionRestaurants.jsx'
import GestionCuisines from '../components/admin/GestionCuisines.jsx'

// Espace de réglages partagé par tous les collègues connectés.
export default function PageAdmin() {
  const { restaurants } = useDonnees()
  const [onglet, setOnglet] = useState('propositions')
  const nbAttente = restaurants.filter((r) => r.statut === 'en_attente').length

  const onglets = [
    { id: 'propositions', texte: `Propositions${nbAttente ? ` (${nbAttente})` : ''}` },
    { id: 'plafonds', texte: 'Plafonds' },
    { id: 'restaurants', texte: 'Restaurants' },
    { id: 'cuisines', texte: 'Types et logos' },
  ]

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">Réglages partagés</h1>

      {/* Onglets accessibles (role="tablist") */}
      <div role="tablist" aria-label="Sections des réglages" className="flex gap-1 overflow-x-auto border-b border-gray-300">
        {onglets.map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            id={`onglet-${o.id}`}
            aria-selected={onglet === o.id}
            aria-controls={`panneau-${o.id}`}
            onClick={() => setOnglet(o.id)}
            className={`min-h-11 shrink-0 border-b-4 px-4 font-semibold ${
              onglet === o.id ? 'border-tomate-800 text-tomate-900' : 'border-transparent text-gray-700'
            }`}
          >
            {o.texte}
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
        {onglet === 'propositions' && <Propositions />}
        {onglet === 'plafonds' && <GestionPlafonds />}
        {onglet === 'restaurants' && <GestionRestaurants />}
        {onglet === 'cuisines' && <GestionCuisines />}
      </section>
    </main>
  )
}
