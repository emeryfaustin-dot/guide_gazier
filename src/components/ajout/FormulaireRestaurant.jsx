import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { localiserAdresse } from '../../services/geocodage.js'
import { verifierBudget } from '../../utils/budget.js'
import { departementDepuisCodePostal } from '../../utils/departement.js'
import { normaliser } from '../../utils/filtres.js'
import Message from '../../ui/Message.jsx'
import { bouton, champ, etiquette } from '../../ui/styles.js'

// Étape 2 de l'ajout : compléter et vérifier les infos, puis proposer le restaurant.
// - Venant de Google : adresse et GPS pré-remplis, on ne conserve que le place_id
//   (téléphone, horaires, site seront relus en direct chez Google).
// - Saisie manuelle : on remplit tout et on localise l'adresse avec OpenStreetMap.
export default function FormulaireRestaurant({ initial, onRetour, onAjoute }) {
  const { plafonds, restaurants, cuisines, utilisateur, service, executer } = useDonnees()
  const depuisGoogle = Boolean(initial?.placeId)

  const [r, setR] = useState({
    nom: initial?.nom ?? '',
    adresse: initial?.adresse ?? '',
    codePostal: initial?.codePostal ?? '',
    ville: initial?.ville ?? '',
    cuisine: '',
    prixMoyen: '',
    telephone: '',
    horaires: '',
    siteWeb: '',
    lat: initial?.lat ?? null,
    lng: initial?.lng ?? null,
    placeId: initial?.placeId ?? null,
  })
  const [localisation, setLocalisation] = useState({ enCours: false, erreur: '' })
  const [enCours, setEnCours] = useState(false)

  // Un champ fourni par Google est verrouillé (sauf s'il est vide : on laisse compléter).
  const verrou = (champNom) => depuisGoogle && Boolean(initial?.[champNom])
  const maj = (champNom, valeur) => setR((avant) => ({ ...avant, [champNom]: valeur }))
  // Si l'adresse change en saisie manuelle, il faut relocaliser.
  const majAdresse = (champNom, valeur) => setR((avant) => ({ ...avant, [champNom]: valeur, ...(depuisGoogle ? {} : { lat: null, lng: null }) }))

  // Valeurs calculées à chaque affichage
  const departement = departementDepuisCodePostal(r.codePostal)
  const budget = verifierBudget(departement, r.prixMoyen, plafonds)
  const doublon = restaurants.find(
    (x) =>
      (r.placeId && x.placeId === r.placeId) ||
      (normaliser(x.nom) === normaliser(r.nom) && normaliser(x.ville) === normaliser(r.ville)),
  )
  const localise = r.lat != null && r.lng != null
  const peutEnvoyer = r.nom.trim() && r.adresse.trim() && r.ville.trim() && r.cuisine && budget.ok && localise && !doublon

  async function localiser() {
    setLocalisation({ enCours: true, erreur: '' })
    try {
      const { lat, lng } = await localiserAdresse(r)
      setR((avant) => ({ ...avant, lat, lng }))
      setLocalisation({ enCours: false, erreur: '' })
    } catch (e) {
      setLocalisation({ enCours: false, erreur: e.message })
    }
  }

  async function envoyer(e) {
    e.preventDefault()
    if (!peutEnvoyer) return
    setEnCours(true)
    let ajoute = null
    const ok = await executer(async () => {
      ajoute = await service.proposerRestaurant(utilisateur, {
        ...r,
        nom: r.nom.trim(),
        adresse: r.adresse.trim(),
        ville: r.ville.trim(),
        departement,
        prixMoyen: Number(r.prixMoyen),
        // Venant de Google : on ne stocke pas ces infos (elles sont relues en direct)
        telephone: depuisGoogle ? null : r.telephone.trim(),
        horaires: depuisGoogle ? null : r.horaires.trim(),
        siteWeb: depuisGoogle ? null : r.siteWeb.trim(),
      })
    }, 'Restaurant proposé aux collègues')
    setEnCours(false)
    if (ok) onAjoute(ajoute)
  }

  return (
    <form onSubmit={envoyer} className="space-y-4">
      {depuisGoogle && (
        <Message type="info">
          Infos trouvées chez Google. Complète le <strong>type de cuisine</strong> et le <strong>prix moyen</strong>.
        </Message>
      )}

      <Champ id="nom" libelle="Nom du restaurant" valeur={r.nom} onChange={(v) => maj('nom', v)} requis />
      <Champ id="adresse" libelle="Adresse (n° et rue)" valeur={r.adresse} onChange={(v) => majAdresse('adresse', v)} requis lectureSeule={verrou('adresse')} />
      <div className="grid grid-cols-[8rem_1fr] gap-3">
        <Champ id="cp" libelle="Code postal" valeur={r.codePostal} onChange={(v) => majAdresse('codePostal', v)} requis lectureSeule={verrou('codePostal')} inputMode="numeric" />
        <Champ id="ville" libelle="Ville" valeur={r.ville} onChange={(v) => majAdresse('ville', v)} requis lectureSeule={verrou('ville')} />
      </div>
      <p className="text-gray-800">
        Département : <strong>{departement ?? '—'}</strong>
      </p>

      <div>
        <label htmlFor="cuisine" className={etiquette}>
          Type de cuisine
        </label>
        <select id="cuisine" required value={r.cuisine} onChange={(e) => maj('cuisine', e.target.value)} className={champ}>
          <option value="">— Choisir —</option>
          {cuisines.map(({ nom }) => (
            <option key={nom}>{nom}</option>
          ))}
        </select>
      </div>

      <Champ
        id="prix"
        libelle="Prix moyen par personne (€)"
        type="number"
        valeur={r.prixMoyen}
        onChange={(v) => maj('prixMoyen', v)}
        requis
        min="1"
        step="0.5"
        inputMode="decimal"
      />

      {/* Contrôle du budget en direct */}
      {r.prixMoyen && departement && <Message type={budget.ok ? 'succes' : 'erreur'}>{budget.message}</Message>}

      {!depuisGoogle && (
        <>
          <Champ id="tel" libelle="Téléphone (facultatif)" type="tel" valeur={r.telephone} onChange={(v) => maj('telephone', v)} />
          <Champ id="horaires" libelle="Horaires (facultatif)" valeur={r.horaires} onChange={(v) => maj('horaires', v)} placeholder="ex : Lun–Ven 12h–14h30" />
          <Champ id="site" libelle="Site web (facultatif)" type="url" valeur={r.siteWeb} onChange={(v) => maj('siteWeb', v)} placeholder="https://…" />

          <div className="space-y-2">
            <button
              type="button"
              className={bouton.secondaire}
              onClick={localiser}
              disabled={localisation.enCours || !r.adresse || !r.ville}
            >
              {localisation.enCours ? 'Localisation…' : '📍 Localiser l’adresse sur la carte'}
            </button>
            {localise && <p className="font-semibold text-green-900">✓ Adresse localisée ({r.lat.toFixed(4)}, {r.lng.toFixed(4)})</p>}
            {!localise && !localisation.erreur && <p className="text-sm text-gray-700">Obligatoire pour placer le marqueur.</p>}
            {localisation.erreur && <Message type="erreur">{localisation.erreur}</Message>}
          </div>
        </>
      )}

      {doublon && (
        <Message type="alerte">
          Ce restaurant semble déjà présent :{' '}
          <a className={bouton.lien} href={`#/restaurant/${doublon.id}`}>
            {doublon.nom}
          </a>
        </Message>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={bouton.principal} disabled={!peutEnvoyer || enCours}>
          {enCours ? 'Envoi…' : 'Proposer le restaurant'}
        </button>
        <button type="button" className={bouton.secondaire} onClick={onRetour}>
          Retour
        </button>
      </div>
    </form>
  )
}

// Champ texte avec son libellé (petit composant réutilisable).
function Champ({ id, libelle, valeur, onChange, requis, lectureSeule, ...autres }) {
  return (
    <div>
      <label htmlFor={id} className={etiquette}>
        {libelle}
      </label>
      <input
        id={id}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        required={requis}
        readOnly={lectureSeule}
        className={`${champ} ${lectureSeule ? 'bg-gray-100 text-gray-700' : ''}`}
        {...autres}
      />
    </div>
  )
}
