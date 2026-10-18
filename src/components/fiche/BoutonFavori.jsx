import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'

// Bouton cœur pour ajouter / retirer un restaurant de ses favoris.
// aria-pressed indique aux lecteurs d'écran si le bouton est "activé".
export default function BoutonFavori({ restaurantId }) {
  const { favoris, utilisateur, service, executer } = useDonnees()
  const [enCours, setEnCours] = useState(false)
  const estFavori = favoris.has(restaurantId)

  async function basculer() {
    setEnCours(true)
    await executer(
      () => service.basculerFavori(utilisateur, restaurantId, !estFavori),
      estFavori ? 'Retiré de tes favoris' : 'Ajouté à tes favoris',
    )
    setEnCours(false)
  }

  return (
    <button
      type="button"
      onClick={basculer}
      disabled={enCours}
      aria-pressed={estFavori}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 font-semibold ${
        estFavori ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-300 bg-white text-gray-800'
      }`}
    >
      <span aria-hidden="true" className="text-xl">
        {estFavori ? '♥' : '♡'}
      </span>
      {estFavori ? 'Favori' : 'Ajouter aux favoris'}
    </button>
  )
}
