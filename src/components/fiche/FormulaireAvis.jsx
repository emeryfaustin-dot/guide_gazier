import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { EtoilesSaisie } from '../../ui/Etoiles.jsx'
import { bouton, champ, etiquette } from '../../ui/styles.js'

// Formulaire pour laisser (ou modifier) SON avis sur un restaurant.
// Un collègue = un avis par restaurant : s'il en a déjà un, on le pré-remplit.
export default function FormulaireAvis({ restaurantId, monAvis, onTermine }) {
  const { utilisateur, service, executer } = useDonnees()
  const [note, setNote] = useState(monAvis?.note ?? 0)
  const [commentaire, setCommentaire] = useState(monAvis?.commentaire ?? '')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function envoyer(e) {
    e.preventDefault() // empêche le rechargement de la page
    if (!note) return setErreur('Choisis une note de 1 à 5 étoiles.')
    setErreur('')
    setEnCours(true)
    const ok = await executer(
      () => service.enregistrerAvis(utilisateur, { restaurantId, note, commentaire: commentaire.trim() }),
      monAvis ? 'Avis modifié' : 'Merci pour ton avis !',
    )
    setEnCours(false)
    if (ok) onTermine?.()
  }

  return (
    <form onSubmit={envoyer} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-bold text-gray-900">{monAvis ? 'Modifier mon avis' : 'Donner mon avis'}</h3>

      <EtoilesSaisie valeur={note} onChange={setNote} nom={`note-${restaurantId}`} />

      <div>
        <label htmlFor={`commentaire-${restaurantId}`} className={etiquette}>
          Commentaire (facultatif)
        </label>
        <textarea
          id={`commentaire-${restaurantId}`}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          maxLength={1000}
          rows={3}
          className={`${champ} py-2`}
          placeholder="Accueil, rapidité, parking, plat du jour…"
        />
      </div>

      {erreur && <p className="font-semibold text-red-800">{erreur}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={bouton.principal} disabled={enCours}>
          {enCours ? 'Enregistrement…' : monAvis ? 'Enregistrer' : 'Publier mon avis'}
        </button>
        {onTermine && monAvis && (
          <button type="button" className={bouton.secondaire} onClick={onTermine}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
