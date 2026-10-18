import { useEffect, useState } from 'react'

// Navigation très simple basée sur la partie "#" de l'adresse :
//   #/             → carte
//   #/liste        → liste
//   #/restaurant/3 → fiche du restaurant 3
//   #/ajouter, #/admin, #/profil
//
// Avantage : le bouton "Retour" du téléphone fonctionne, sans installer de librairie,
// et aucun réglage serveur n'est nécessaire sur Vercel.

const VUES = ['carte', 'liste']

function lireRoute(derniereVue = 'carte') {
  const chemin = window.location.hash.replace(/^#/, '') || '/'
  const morceaux = chemin.split('/').filter(Boolean) // "/restaurant/3" → ["restaurant", "3"]
  const page = morceaux[0] ?? 'carte'
  return {
    page,
    id: morceaux[1] ?? null,
    // Dernière vue Carte/Liste visitée : affichée derrière une fiche, et où l'on revient en la fermant.
    derniereVue: VUES.includes(page) ? page : derniereVue,
  }
}

export function useRoute() {
  const [route, setRoute] = useState(() => lireRoute())

  useEffect(() => {
    const surChangement = () => setRoute((avant) => lireRoute(avant.derniereVue))
    window.addEventListener('hashchange', surChangement)
    return () => window.removeEventListener('hashchange', surChangement)
  }, [])

  return route
}

/** Change de page : aller('/liste'), aller('/restaurant/3')… */
export function aller(chemin) {
  window.location.hash = chemin
}
