import ChampSelect from '../../ui/ChampSelect.jsx'
import { OPTIONS_BUDGET, OPTIONS_NOTE } from '../../config/cuisines.js'
import { FILTRES_PAR_DEFAUT } from '../../utils/filtres.js'
import { useDonnees } from '../../contexte/DonneesContexte.jsx'
import { bouton } from '../../ui/styles.js'

// Panneau des filtres : cuisine, département, budget, note, favoris.
// Les listes déroulantes stockent du texte ; on convertit en nombre quand il faut.
export default function PanneauFiltres({ filtres, setFiltres, onFermer }) {
  const { plafonds, cuisines } = useDonnees()
  const maj = (champ, valeur) => setFiltres({ ...filtres, [champ]: valeur })
  const versNombre = (v) => (v === '' ? null : Number(v))

  return (
    <div id="panneau-filtres" className="mx-auto mt-3 max-w-5xl space-y-3 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgb(40_30_20/0.10)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ChampSelect
          libelle="Type de cuisine"
          valeur={filtres.cuisine}
          onChange={(v) => maj('cuisine', v)}
          options={[{ valeur: '', texte: 'Toutes' }, ...cuisines.map(({ nom }) => ({ valeur: nom, texte: nom }))]}
        />
        <ChampSelect
          libelle="Département"
          valeur={filtres.departement}
          onChange={(v) => maj('departement', v)}
          options={[
            { valeur: '', texte: 'Tous' },
            ...plafonds.map((p) => ({ valeur: p.departement, texte: `${p.departement} – ${p.nom}` })),
          ]}
        />
        <ChampSelect
          libelle="Prix max par personne"
          valeur={filtres.budgetMax ?? ''}
          onChange={(v) => maj('budgetMax', versNombre(v))}
          options={OPTIONS_BUDGET.map((b) => ({ valeur: b ?? '', texte: b == null ? 'Peu importe' : `${b} € maximum` }))}
        />
        <ChampSelect
          libelle="Note minimale"
          valeur={filtres.noteMin ?? ''}
          onChange={(v) => maj('noteMin', versNombre(v))}
          options={OPTIONS_NOTE.map((n) => ({
            valeur: n ?? '',
            texte: n == null ? 'Toutes' : `${String(n).replace('.', ',')} ★ et plus`,
          }))}
        />
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
        <CaseACocher
          libelle="Dans le plafond du département uniquement"
          coche={filtres.dansLePlafond}
          onChange={(v) => maj('dansLePlafond', v)}
        />
        <CaseACocher
          libelle="Mes favoris uniquement"
          coche={filtres.favorisSeulement}
          onChange={(v) => maj('favorisSeulement', v)}
        />
      </div>

      <div className="flex gap-2">
        <button type="button" className={bouton.secondaire} onClick={() => setFiltres({ ...FILTRES_PAR_DEFAUT, texte: filtres.texte })}>
          Réinitialiser
        </button>
        <button type="button" className={bouton.principal} onClick={onFermer}>
          Fermer les filtres
        </button>
      </div>
    </div>
  )
}

// Case à cocher avec une grande zone cliquable (toute la ligne).
function CaseACocher({ libelle, coche, onChange }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-gray-900">
      <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-natran-800" />
      {libelle}
    </label>
  )
}
