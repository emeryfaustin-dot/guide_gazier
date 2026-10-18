import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { bouton, champ } from '../../ui/styles.js'

// Table de configuration des plafonds par département : modifier, ajouter, supprimer.
export default function GestionPlafonds() {
  const { plafonds, restaurants, utilisateur, service, executer } = useDonnees()
  const [nouveau, setNouveau] = useState({ departement: '', nom: '', plafond: '' })

  async function ajouter(e) {
    e.preventDefault()
    const ok = await executer(
      () =>
        service.enregistrerPlafond(utilisateur, {
          departement: nouveau.departement.trim().toUpperCase(),
          nom: nouveau.nom.trim(),
          plafond: Number(nouveau.plafond),
        }),
      'Plafond ajouté',
    )
    if (ok) setNouveau({ departement: '', nom: '', plafond: '' })
  }

  return (
    <div className="space-y-5">
      <p className="text-gray-700">
        Un restaurant est « dans le budget » si son prix moyen est inférieur ou égal au plafond de son département. Les changements
        s’appliquent immédiatement à toute la carte.
      </p>

      <ul className="space-y-2">
        {plafonds.map((p) => (
          <LignePlafond
            key={p.departement}
            plafond={p}
            nbRestaurants={restaurants.filter((r) => r.departement === p.departement).length}
          />
        ))}
      </ul>

      <form onSubmit={ajouter} className="space-y-3 rounded-xl border border-dashed border-gray-400 p-4">
        <h3 className="font-bold">Ajouter un département</h3>
        <div className="grid grid-cols-[5rem_1fr_6rem] gap-2">
          <input
            aria-label="Numéro de département"
            required
            pattern="[0-9AB]{2,3}"
            placeholder="N°"
            value={nouveau.departement}
            onChange={(e) => setNouveau({ ...nouveau, departement: e.target.value })}
            className={champ}
          />
          <input
            aria-label="Nom du département"
            required
            placeholder="Nom"
            value={nouveau.nom}
            onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
            className={champ}
          />
          <input
            aria-label="Plafond en euros"
            required
            type="number"
            min="1"
            step="0.5"
            placeholder="€"
            value={nouveau.plafond}
            onChange={(e) => setNouveau({ ...nouveau, plafond: e.target.value })}
            className={champ}
          />
        </div>
        <button type="submit" className={bouton.principal}>
          Ajouter
        </button>
      </form>
    </div>
  )
}

// Une ligne de la table : le plafond est modifiable directement.
function LignePlafond({ plafond, nbRestaurants }) {
  const { utilisateur, service, executer } = useDonnees()
  const [valeur, setValeur] = useState(String(plafond.plafond))
  const modifie = Number(valeur) !== plafond.plafond

  const enregistrer = () =>
    executer(
      () => service.enregistrerPlafond(utilisateur, { ...plafond, plafond: Number(valeur) }),
      `Plafond ${plafond.nom} : ${valeur} €`,
    )

  async function supprimer() {
    const avertissement = nbRestaurants
      ? `${nbRestaurants} restaurant(s) de ce département passeront « hors budget ». Continuer ?`
      : 'Supprimer ce plafond ?'
    if (!window.confirm(avertissement)) return
    await executer(() => service.supprimerPlafond(utilisateur, plafond.departement), 'Plafond supprimé')
  }

  const idChamp = `plafond-${plafond.departement}`
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
      <label htmlFor={idChamp} className="min-w-40 flex-1 font-semibold">
        {plafond.departement} – {plafond.nom}
        <span className="block text-sm font-normal text-gray-700">{nbRestaurants} restaurant(s)</span>
      </label>
      <div className="flex items-center gap-1">
        <input
          id={idChamp}
          type="number"
          min="1"
          step="0.5"
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          className={`${champ} w-24`}
        />
        <span aria-hidden="true">€</span>
      </div>
      <button type="button" className={bouton.principal} onClick={enregistrer} disabled={!modifie || !Number(valeur)}>
        Enregistrer
      </button>
      <button type="button" className={bouton.danger} onClick={supprimer} aria-label={`Supprimer le plafond ${plafond.nom}`}>
        Supprimer
      </button>
    </li>
  )
}
