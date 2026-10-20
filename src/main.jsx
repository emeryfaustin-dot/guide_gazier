// Point d'entrée de l'application : React "monte" le composant App
// dans la balise <div id="root"> du fichier index.html.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Styles de la carte Leaflet (indispensables, sinon les tuiles s'affichent en désordre)
import 'leaflet/dist/leaflet.css'
// Nos styles globaux + Tailwind
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Enregistre le service worker (version en ligne seulement) : permet
// d'installer l'app sur l'écran d'accueil du téléphone.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
