import { useEffect } from 'react'
import { useDonnees } from '../contexte/DonneesContexte.jsx'

// Petit message temporaire ("Avis enregistré", "Erreur…") en bas de l'écran.
// role="status" : les lecteurs d'écran l'annoncent automatiquement.
export default function Notification() {
  const { notification, setNotification } = useDonnees()

  useEffect(() => {
    if (!notification) return
    const minuteur = setTimeout(() => setNotification(null), notification.type === 'erreur' ? 6000 : 3000)
    return () => clearTimeout(minuteur)
  }, [notification, setNotification])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[2000] flex justify-center px-4">
      {notification && (
        <p
          className={`pointer-events-auto max-w-md rounded-lg px-4 py-3 text-center font-semibold shadow-lg ${
            notification.type === 'erreur' ? 'bg-red-800 text-white' : 'bg-gray-900 text-white'
          }`}
        >
          {notification.texte}
        </p>
      )}
    </div>
  )
}
