import { useState } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'
import Message from '../ui/Message.jsx'
import { bouton, champ, etiquette } from '../ui/styles.js'

// Page profil : modifier son prénom (affiché sur ses avis), se déconnecter.
// Elle sert aussi d'écran "Comment t'appelles-tu ?" si le prénom est vide.
export default function PageProfil() {
  const { utilisateur, service, executer, favoris, avis } = useDonnees()
  const [prenom, setPrenom] = useState(utilisateur.prenom)
  const prenomManquant = !utilisateur.prenom
  const nbAvis = avis.filter((a) => a.auteurId === utilisateur.id).length

  async function enregistrer(e) {
    e.preventDefault()
    await executer(() => service.modifierPrenom(utilisateur, prenom.trim()), 'Prénom enregistré')
  }

  async function reinitialiserDemo() {
    if (!window.confirm('Remettre les données de démonstration à zéro ?')) return
    await executer(() => service.reinitialiser(), 'Données de démo réinitialisées')
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      {prenomManquant && <Message type="info">Indique ton prénom : il apparaîtra sur tes avis.</Message>}

      <form onSubmit={enregistrer} className="space-y-3">
        <div>
          <label htmlFor="profil-prenom" className={etiquette}>
            Prénom
          </label>
          <input id="profil-prenom" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className={champ} />
        </div>
        <button type="submit" className={bouton.principal} disabled={!prenom.trim() || prenom.trim() === utilisateur.prenom}>
          Enregistrer
        </button>
      </form>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-white p-4 shadow-sm">
        <dt className="font-semibold text-gray-700">Email</dt>
        <dd className="break-all">{utilisateur.email}</dd>
        <dt className="font-semibold text-gray-700">Rôle</dt>
        <dd>{utilisateur.role === 'admin' ? 'Administrateur' : 'Agent'}</dd>
        <dt className="font-semibold text-gray-700">Favoris</dt>
        <dd>{favoris.size}</dd>
        <dt className="font-semibold text-gray-700">Avis donnés</dt>
        <dd>{nbAvis}</dd>
      </dl>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={bouton.secondaire} onClick={() => service.deconnexion()}>
          Se déconnecter
        </button>
        {service.mode === 'demo' && (
          <button type="button" className={bouton.danger} onClick={reinitialiserDemo}>
            Réinitialiser la démo
          </button>
        )}
      </div>
    </main>
  )
}
