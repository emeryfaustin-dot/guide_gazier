import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { EtoilesAffichage } from '../../ui/Etoiles.jsx'
import FormulaireAvis from './FormulaireAvis.jsx'
import { bouton } from '../../ui/styles.js'
import { formaterNote } from '../../utils/notes.js'

// Section "Avis des collègues" de la fiche : formulaire + liste des avis.
export default function SectionAvis({ restaurantId }) {
  const { avis, stats, utilisateur, service, executer } = useDonnees()
  const [modeEdition, setModeEdition] = useState(false)

  const avisDuRestaurant = avis.filter((a) => a.restaurantId === restaurantId)
  const monAvis = avisDuRestaurant.find((a) => a.auteurId === utilisateur.id)
  const statsResto = stats[restaurantId]

  async function supprimer(a) {
    // confirm() : boîte de dialogue native, simple et accessible
    if (!window.confirm('Supprimer cet avis ?')) return
    await executer(() => service.supprimerAvis(utilisateur, a.id), 'Avis supprimé')
    setModeEdition(false)
  }

  return (
    <section aria-labelledby="titre-avis" className="space-y-4">
      <h2 id="titre-avis" className="text-lg font-bold text-gray-900">
        Avis des collègues{' '}
        <span className="font-normal text-gray-700">
          {statsResto ? `· ${formaterNote(statsResto.moyenne)} / 5 (${statsResto.nombre})` : ''}
        </span>
      </h2>

      {/* Pas encore d'avis, ou édition en cours → formulaire */}
      {(!monAvis || modeEdition) && (
        <FormulaireAvis
          key={monAvis?.id ?? 'nouveau'}
          restaurantId={restaurantId}
          monAvis={monAvis}
          onTermine={() => setModeEdition(false)}
        />
      )}

      {avisDuRestaurant.length === 0 ? (
        <p className="text-gray-700">Aucun avis pour l’instant. Sois le premier !</p>
      ) : (
        <ul className="space-y-3">
          {avisDuRestaurant.map((a) => {
            const estLeMien = a.auteurId === utilisateur.id
            const peutSupprimer = estLeMien || utilisateur.role === 'admin'
            return (
              <li key={a.id} className={`rounded-xl border p-4 ${estLeMien ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-gray-900">
                    {a.prenom || 'Collègue'}
                    {estLeMien && <span className="font-normal text-gray-700"> (moi)</span>}
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(a.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {a.modifieLe ? ' · modifié' : ''}
                  </p>
                </div>
                <EtoilesAffichage note={a.note} />
                {a.commentaire && <p className="mt-1 whitespace-pre-line text-gray-800">{a.commentaire}</p>}

                {(estLeMien || peutSupprimer) && !modeEdition && (
                  <div className="mt-3 flex gap-2">
                    {estLeMien && (
                      <button type="button" className={bouton.secondaire} onClick={() => setModeEdition(true)}>
                        Modifier
                      </button>
                    )}
                    {peutSupprimer && (
                      <button type="button" className={bouton.danger} onClick={() => supprimer(a)}>
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
