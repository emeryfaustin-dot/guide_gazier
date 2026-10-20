import { useState } from 'react'
import { rechercherPlaces } from '../../services/places.js'
import Message from '../../ui/Message.jsx'
import { bouton, champ, etiquette } from '../../ui/styles.js'

// Étape 1 de l'ajout : chercher le restaurant chez Google (nom ou lien Google Maps).
// onChoisir(resultat) est appelé quand l'utilisateur sélectionne un résultat.
export default function RechercheGoogle({ onChoisir, onManuel }) {
  const [texte, setTexte] = useState('')
  const [resultats, setResultats] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function chercher(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur('')
    setResultats(null)
    try {
      setResultats(await rechercherPlaces(texte.trim()))
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={chercher} className="space-y-3">
        <div>
          <label htmlFor="recherche-google" className={etiquette}>
            Nom du restaurant (avec la ville) ou lien Google Maps
          </label>
          <input
            id="recherche-google"
            required
            minLength={2}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className={champ}
            placeholder="ex : Le Relais Lamorlaye, ou https://maps.app.goo.gl/…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={bouton.principal} disabled={enCours}>
            {enCours ? 'Recherche…' : 'Rechercher'}
          </button>
          <button type="button" className={bouton.secondaire} onClick={onManuel}>
            Saisir manuellement
          </button>
        </div>
      </form>

      {erreur && (
        <Message type="alerte">
          <p className="font-semibold">{erreur}</p>
          <p className="mt-1">Pas de souci : tu peux saisir le restaurant à la main.</p>
          <button type="button" className={`${bouton.secondaire} mt-2`} onClick={onManuel}>
            Passer à la saisie manuelle
          </button>
        </Message>
      )}

      {resultats && resultats.length === 0 && (
        <Message type="info">Aucun résultat. Ajoute la ville dans ta recherche, ou saisis le restaurant à la main.</Message>
      )}

      {resultats?.length > 0 && (
        <ul className="space-y-2" aria-label="Résultats Google">
          {resultats.map((r) => (
            <li key={r.placeId}>
              <button
                type="button"
                onClick={() => onChoisir(r)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-left hover:border-natran-500 hover:bg-natran-50"
              >
                <span className="block font-bold text-gray-900">{r.nom}</span>
                <span className="block text-gray-700">{r.adresseComplete}</span>
              </button>
            </li>
          ))}
          <li className="text-xs text-gray-700">Résultats fournis par Google</li>
        </ul>
      )}
    </div>
  )
}
