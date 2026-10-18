import { useId } from 'react'
import { champ, etiquette } from './styles.js'

// Liste déroulante avec son libellé, réutilisable.
// options : [{ valeur, texte }]
export default function ChampSelect({ libelle, valeur, onChange, options }) {
  const id = useId() // identifiant unique pour relier <label> et <select>
  return (
    <div>
      <label htmlFor={id} className={etiquette}>
        {libelle}
      </label>
      <select id={id} value={valeur} onChange={(e) => onChange(e.target.value)} className={champ}>
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.texte}
          </option>
        ))}
      </select>
    </div>
  )
}
