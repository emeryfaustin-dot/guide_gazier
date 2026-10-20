import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { ICONES_CUISINE } from '../../config/cuisines.js'
import { VignetteCuisine } from '../../ui/Icone.jsx'
import { bouton, champ, etiquette } from '../../ui/styles.js'

const COULEUR_DEFAUT = '#7a2638'

export default function GestionCuisines() {
  const { cuisines, restaurants, utilisateur, service, executer } = useDonnees()
  const [nom, setNom] = useState('')
  const [couleur, setCouleur] = useState(COULEUR_DEFAUT)
  const [icone, setIcone] = useState('couverts')

  async function ajouter(e) {
    e.preventDefault()
    const nomNettoye = nom.trim()
    if (!nomNettoye || cuisines.some((cuisine) => cuisine.nom.toLocaleLowerCase() === nomNettoye.toLocaleLowerCase())) {
      return
    }
    const ok = await executer(
      () => service.enregistrerCuisine(utilisateur, { nom: nomNettoye, couleur, icone }),
      `${nomNettoye} ajouté aux types de restaurants`,
    )
    if (ok) setNom('')
  }

  return (
    <div className="space-y-5">
      <form onSubmit={ajouter} className="space-y-3 border-b border-gray-200 pb-5">
        <h2 className="text-lg font-bold text-gray-900">Ajouter un type de restaurant</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="nouvelle-cuisine" className={etiquette}>Nom</label>
            <input id="nouvelle-cuisine" value={nom} onChange={(e) => setNom(e.target.value)} className={champ} placeholder="Libanais" maxLength={40} required />
          </div>
          <ChoixCouleur id="nouvelle-couleur" valeur={couleur} onChange={setCouleur} />
          <ChoixIcone id="nouvelle-icone" valeur={icone} onChange={setIcone} />
          <button type="submit" className={bouton.principal} disabled={!nom.trim() || cuisines.some((cuisine) => cuisine.nom.toLocaleLowerCase() === nom.trim().toLocaleLowerCase())}>
            Ajouter
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          Aperçu <VignetteCuisine cuisine={nom.trim() || 'Aperçu'} cuisines={[{ nom: nom.trim() || 'Aperçu', couleur, icone }]} taille={30} arrondi={8} />
        </div>
      </form>

      <ul className="space-y-2">
        {cuisines.map((cuisine) => (
          <LigneCuisine
            key={cuisine.nom}
            cuisine={cuisine}
            utilise={restaurants.some((restaurant) => restaurant.cuisine === cuisine.nom)}
            cuisines={cuisines}
            utilisateur={utilisateur}
            service={service}
            executer={executer}
          />
        ))}
      </ul>
      {!cuisines.length && <p className="text-sm text-gray-600">Aucun type configuré. Ajoute-en un ci-dessus.</p>}
    </div>
  )
}

function LigneCuisine({ cuisine, utilise, cuisines, utilisateur, service, executer }) {
  const [nom, setNom] = useState(cuisine.nom)
  const [couleur, setCouleur] = useState(cuisine.couleur)
  const [icone, setIcone] = useState(cuisine.icone)
  const modifie = nom.trim() !== cuisine.nom || couleur !== cuisine.couleur || icone !== cuisine.icone
  const nomDejaPris = cuisines.some((autre) => autre.nom !== cuisine.nom && autre.nom.toLocaleLowerCase() === nom.trim().toLocaleLowerCase())

  async function enregistrer(e) {
    e.preventDefault()
    const nouveauNom = nom.trim()
    if (!nouveauNom || nomDejaPris) return
    await executer(
      () => service.enregistrerCuisine(utilisateur, { nom: nouveauNom, couleur, icone }, cuisine.nom),
      `${nouveauNom} mis à jour`,
    )
  }

  async function supprimer() {
    if (!window.confirm(`Supprimer le type « ${cuisine.nom} » ?`)) return
    await executer(() => service.supprimerCuisine(utilisateur, cuisine.nom), `${cuisine.nom} supprimé`)
  }

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-3">
      <form onSubmit={enregistrer} className="grid gap-3 sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-end">
        <VignetteCuisine cuisine={cuisine.nom} cuisines={cuisines} taille={40} arrondi={10} />
        <div>
          <label htmlFor={`nom-${cuisine.nom}`} className={etiquette}>Nom</label>
          <input id={`nom-${cuisine.nom}`} value={nom} onChange={(e) => setNom(e.target.value)} className={champ} maxLength={40} required />
        </div>
        <ChoixCouleur id={`couleur-${cuisine.nom}`} valeur={couleur} onChange={setCouleur} />
        <ChoixIcone id={`icone-${cuisine.nom}`} valeur={icone} onChange={setIcone} />
        <button type="submit" className={bouton.secondaire} disabled={!modifie || nomDejaPris}>Enregistrer</button>
        <button type="button" className={bouton.danger} onClick={supprimer} disabled={utilise} title={utilise ? 'Ce type est utilisé par un restaurant' : undefined}>
          Supprimer
        </button>
      </form>
      {nomDejaPris && <p className="mt-2 text-sm text-hors">Ce nom existe déjà.</p>}
    </li>
  )
}

function ChoixCouleur({ id, valeur, onChange }) {
  return (
    <div>
      <label htmlFor={id} className={etiquette}>Couleur</label>
      <input id={id} type="color" value={valeur} onChange={(e) => onChange(e.target.value)} className="h-11 w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1" />
    </div>
  )
}

function ChoixIcone({ id, valeur, onChange }) {
  return (
    <div>
      <label htmlFor={id} className={etiquette}>Logo</label>
      <select id={id} value={valeur} onChange={(e) => onChange(e.target.value)} className={champ}>
        {Object.keys(ICONES_CUISINE).map((nom) => <option key={nom} value={nom}>{nom}</option>)}
      </select>
    </div>
  )
}