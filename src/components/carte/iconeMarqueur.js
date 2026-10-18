import L from 'leaflet'

// On dessine nos propres marqueurs en SVG plutôt que d'utiliser l'image
// par défaut de Leaflet (qui s'affiche mal avec Vite et ne permet pas
// de distinguer les restaurants validés de ceux hors budget).
//
// Accessibilité : la différence ne repose pas que sur la couleur.
// Validé = vert + coche ✓ ; hors budget = orange + point d'exclamation !

function creerIcone(couleur, symbole) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">
      <path d="M18 1C8.6 1 1 8.6 1 18c0 12.4 17 27 17 27s17-14.6 17-27C35 8.6 27.4 1 18 1z"
            fill="${couleur}" stroke="#ffffff" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="16" font-weight="700"
            font-family="system-ui, sans-serif" fill="#ffffff">${symbole}</text>
    </svg>`

  return L.divIcon({
    html: svg,
    className: '', // retire le style par défaut (carré blanc) de Leaflet
    iconSize: [36, 46],
    iconAnchor: [18, 45], // la pointe du marqueur touche l'emplacement exact
    popupAnchor: [0, -40], // la fiche s'ouvre au-dessus du marqueur
  })
}

export const iconeValide = creerIcone('#15803d', '✓') // vert foncé
export const iconeHorsBudget = creerIcone('#b45309', '!') // orange foncé
