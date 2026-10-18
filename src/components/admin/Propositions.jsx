import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import BadgeBudget from '../../ui/BadgeBudget.jsx'
import { bouton } from '../../ui/styles.js'

// Liste des restaurants proposés par les collègues, en attente de validation.
export default function Propositions() {
  const { restaurants, plafonds, utilisateur, service, executer } = useDonnees()
  const enAttente = restaurants.filter((r) => r.statut === 'en_attente')

  const changer = (r, statut) =>
    executer(
      () => service.changerStatutRestaurant(utilisateur, r.id, statut),
      statut === 'valide' ? `${r.nom} est publié` : `${r.nom} est refusé`,
    )

  if (!enAttente.length) return <p className="text-gray-700">Aucune proposition en attente. 👍</p>

  return (
    <ul className="space-y-3">
      {enAttente.map((r) => (
        <li key={r.id} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-lg font-bold">
            <a href={`#/restaurant/${r.id}`} className="hover:underline">
              {r.nom}
            </a>
          </h3>
          <p className="text-gray-700">
            {r.cuisine} · {r.adresse}, {r.codePostal} {r.ville} · ~{r.prixMoyen} € / pers.
          </p>
          <BadgeBudget restaurant={r} plafonds={plafonds} />
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" className={bouton.principal} onClick={() => changer(r, 'valide')}>
              ✓ Valider
            </button>
            <button type="button" className={bouton.danger} onClick={() => changer(r, 'refuse')}>
              ✗ Refuser
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
