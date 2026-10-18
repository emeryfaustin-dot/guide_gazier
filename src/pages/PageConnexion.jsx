import { useState } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'
import Message from '../ui/Message.jsx'
import { aller } from '../hooks/useRoute.js'
import { bouton, champ, etiquette } from '../ui/styles.js'

// Page de connexion.
// - Avec Supabase : on saisit son email, on reçoit un "lien magique" (pas de mot de passe à retenir).
// - En mode démo : connexion immédiate, avec une case pour tester le rôle administrateur.
export default function PageConnexion() {
  const { service } = useDonnees()
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [admin, setAdmin] = useState(false)
  const [etat, setEtat] = useState({ enCours: false, lienEnvoye: false, erreur: '' })
  const demo = service.mode === 'demo'

  async function envoyer(e) {
    e.preventDefault()
    setEtat({ enCours: true, lienEnvoye: false, erreur: '' })
    try {
      const { lienEnvoye } = await service.connexion({ email: email.trim(), prenom: prenom.trim(), admin })
      setEtat({ enCours: false, lienEnvoye, erreur: '' })
      if (!lienEnvoye) aller('/') // mode démo : connecté tout de suite → direction la carte
    } catch (err) {
      setEtat({ enCours: false, lienEnvoye: false, erreur: err.message })
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-blue-800 p-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <p className="text-4xl" aria-hidden="true">
            🍽️
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Guide du gazier</h1>
          <p className="text-gray-700">Les bonnes adresses validées par les collègues</p>
        </div>

        {etat.lienEnvoye ? (
          <Message type="succes">
            <p className="font-bold">Vérifie ta boîte mail !</p>
            <p>
              Un lien de connexion a été envoyé à <strong>{email}</strong>. Clique dessus depuis ce même appareil.
            </p>
          </Message>
        ) : (
          <form onSubmit={envoyer} className="space-y-4">
            {demo && (
              <Message type="alerte">
                <strong>Mode démo</strong> : Supabase n’est pas configuré. Les données restent dans ce navigateur.
              </Message>
            )}

            <div>
              <label htmlFor="prenom" className={etiquette}>
                Prénom
              </label>
              <input
                id="prenom"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoComplete="given-name"
                className={champ}
              />
            </div>

            <div>
              <label htmlFor="email" className={etiquette}>
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={champ}
                placeholder="prenom.nom@grtgaz.com"
              />
            </div>

            {demo && (
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} className="h-5 w-5 accent-blue-800" />
                Me connecter en administrateur (démo)
              </label>
            )}

            {etat.erreur && <Message type="erreur">{etat.erreur}</Message>}

            <button type="submit" className={`${bouton.principal} w-full`} disabled={etat.enCours}>
              {etat.enCours ? 'Envoi…' : demo ? 'Entrer' : 'Recevoir mon lien de connexion'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
