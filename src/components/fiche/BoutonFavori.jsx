import { useState } from 'react'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import Icone from '../../ui/Icone.jsx'

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
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-bold ${
        estFavori ? 'bg-natran-50 text-natran-700' : 'bg-white/95 text-gray-900'
      }`}
    >
      <Icone nom="coeur" taille={20} plein={estFavori} />
      {estFavori ? 'Favori' : 'Ajouter aux favoris'}
    </button>
  )
}
