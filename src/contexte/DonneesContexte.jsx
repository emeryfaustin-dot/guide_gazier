import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { service } from '../services/donnees.js'
import { statistiquesNotes } from '../utils/notes.js'

// Le "contexte" React partage les données avec tous les composants,
// sans devoir les passer de parent en enfant à chaque niveau.

const DonneesContexte = createContext(null)

export function FournisseurDonnees({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [sessionVerifiee, setSessionVerifiee] = useState(false)
  const [donnees, setDonnees] = useState({ restaurants: [], plafonds: [], avis: [], favoris: new Set() })
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [notification, setNotification] = useState(null)

  // 1. Au démarrage : récupère ou crée la session invitée, puis écoute ses changements.
  useEffect(() => {
    service.obtenirUtilisateur().then((u) => {
      setUtilisateur(u)
      setSessionVerifiee(true)
    }).catch((e) => {
      setErreur(e.message)
      setSessionVerifiee(true)
    })
    return service.surChangementSession((u) => {
      setUtilisateur(u)
      setSessionVerifiee(true)
    })
  }, [])

  // 2. (Re)charge toutes les données depuis le service.
  const recharger = useCallback(async () => {
    if (!utilisateur) return
    setChargement(true)
    setErreur(null)
    try {
      setDonnees(await service.chargerTout(utilisateur))
    } catch (e) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }, [utilisateur])

  // Chargement initial (et à chaque changement d'utilisateur).
  // Promise.resolve().then : lance le chargement juste après l'affichage.
  useEffect(() => {
    Promise.resolve().then(recharger)
  }, [recharger])

  // Affiche un petit message temporaire en bas de l'écran.
  const notifier = useCallback((texte, type = 'succes') => {
    setNotification({ texte, type, id: Date.now() })
  }, [])

  /**
   * Exécute une action (ajout d'avis, favori…), recharge les données,
   * et affiche un message de succès ou d'erreur. Renvoie true si tout s'est bien passé.
   */
  const executer = useCallback(
    async (action, messageSucces) => {
      try {
        await action()
        await recharger()
        if (messageSucces) notifier(messageSucces)
        return true
      } catch (e) {
        notifier(e.message, 'erreur')
        return false
      }
    },
    [recharger, notifier],
  )

  // Notes moyennes recalculées seulement quand les avis changent (useMemo).
  const stats = useMemo(() => statistiquesNotes(donnees.avis), [donnees.avis])

  const valeur = {
    ...donnees,
    stats,
    utilisateur,
    sessionVerifiee,
    chargement,
    erreur,
    notification,
    setNotification,
    notifier,
    executer,
    recharger,
    service,
  }

  return <DonneesContexte.Provider value={valeur}>{children}</DonneesContexte.Provider>
}

/** À utiliser dans un composant : const { restaurants, utilisateur } = useDonnees() */
// eslint-disable-next-line react-refresh/only-export-components
export function useDonnees() {
  return useContext(DonneesContexte)
}
