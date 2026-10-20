import L from 'leaflet'
import { styleCuisine } from '../../config/cuisines.js'

// On dessine nos propres pins en SVG (l'image par défaut de Leaflet s'affiche mal avec Vite).
//
// Chaque pin = une bulle arrondie AUX COULEURS DE LA CUISINE + son pictogramme
// (verre de vin, bol, burger, sardine, pizza, couverts).
// Hors budget = même pin + une pastille « ! » orange en haut à droite :
// l'info ne repose donc pas uniquement sur la couleur (accessibilité).

function creerIcone(cuisine, horsBudget, cuisines) {
  const style = styleCuisine(cuisine, cuisines)
  const traits = style.traits.map((d) => `<path d="${d}"/>`).join('')
  const pastille = horsBudget
    ? `<circle cx="35" cy="6" r="6" fill="#fff4e6" stroke="#8a4300" stroke-width="1.6"/>
       <path d="M35 3v3.4M35 8.6v.1" stroke="#8a4300" stroke-width="1.8" stroke-linecap="round"/>`
    : ''

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48" aria-hidden="true" class="pin-resto">
      <path d="M14 38 L20 46 L26 38 Z" fill="${style.couleur}"/>
      <rect x="2" y="2" width="36" height="36" rx="13" fill="${style.couleur}" stroke="#ffffff" stroke-width="2.5"/>
      <g transform="translate(10 10) scale(0.833)" fill="none" stroke="${style.encre}" stroke-width="2.2"
         stroke-linecap="round" stroke-linejoin="round">${traits}</g>
      ${pastille}
    </svg>`

  return L.divIcon({
    html: svg,
    className: '', // retire le style par défaut (carré blanc) de Leaflet
    iconSize: [40, 48],
    iconAnchor: [20, 46], // la pointe du pin touche l'emplacement exact
    popupAnchor: [0, -44], // la fiche s'ouvre au-dessus du pin
  })
}

// On garde les icônes déjà créées en mémoire : une seule icône par combinaison
// (cuisine × budget), au lieu d'en recréer une à chaque affichage.
const cache = new Map()

export function iconePour(cuisine, horsBudget, cuisines) {
  const style = styleCuisine(cuisine, cuisines)
  const cle = `${cuisine}|${horsBudget}|${style.couleur}|${style.icone}`
  if (!cache.has(cle)) cache.set(cle, creerIcone(cuisine, horsBudget, cuisines))
  return cache.get(cle)
}
