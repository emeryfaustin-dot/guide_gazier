import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import BadgeBudget from '../../ui/BadgeBudget.jsx'
import { bouton } from '../../ui/styles.js'

const LIBELLES_STATUT = { valide: 'Publié', en_attente: 'En attente', refuse: 'Refusé' }

// Tous les restaurants (publiés, en attente, refusés) : halal oui/non, retirer de la carte, republier, supprimer.
export default function GestionRestaurants() {
  const { restaurants, plafonds, utilisateur, service, executer } = useDonnees()
  const tries = [...restaurants].sort((a, b) => a.nom.localeCompare(b.nom))

  async function supprimer(r) {
    if (!window.confirm(`Supprimer définitivement « ${r.nom} » et tous ses avis ?`)) return
    await executer(() => service.supprimerRestaurant(utilisateur, r.id), `${r.nom} supprimé`)
  }

  return (
    <ul className="space-y-2">
      {tries.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
          <div className="min-w-48 flex-1">
            <a href={`#/restaurant/${r.id}`} className="font-bold hover:underline">
              {r.nom}
            </a>
            <p className="text-sm text-gray-700">
              {r.ville} ({r.departement}) · ~{r.prixMoyen} € · <strong>{LIBELLES_STATUT[r.statut]}</strong>
            </p>
            <BadgeBudget restaurant={r} plafonds={plafonds} compact />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 px-1 font-semibold text-gray-900">
            <input
              type="checkbox"
              checked={Boolean(r.halal)}
              onChange={(e) =>
                executer(
                  () => service.changerHalalRestaurant(utilisateur, r.id, e.target.checked),
                  e.target.checked ? `${r.nom} marqué halal` : `${r.nom} n’est plus marqué halal`,
                )
              }
              className="h-5 w-5 accent-natran-800"
            />
            Halal
          </label>
          {r.statut === 'valide' ? (
            <button
              type="button"
              className={bouton.secondaire}
              onClick={() => executer(() => service.changerStatutRestaurant(utilisateur, r.id, 'refuse'), `${r.nom} retiré de la carte`)}
            >
              Retirer
            </button>
          ) : (
            <button
              type="button"
              className={bouton.secondaire}
              onClick={() => executer(() => service.changerStatutRestaurant(utilisateur, r.id, 'valide'), `${r.nom} publié`)}
            >
              Publier
            </button>
          )}
          <button type="button" className={bouton.danger} onClick={() => supprimer(r)}>
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  )
}
