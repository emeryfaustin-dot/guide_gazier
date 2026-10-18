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
