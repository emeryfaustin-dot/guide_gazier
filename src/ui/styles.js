// Classes Tailwind réutilisées partout : un seul endroit pour changer le style des boutons et champs.
// min-h-11 = 44 px de haut : taille minimale recommandée pour une cible tactile.
// Couleurs : voir la charte dans src/index.css (tomate = action, gray = gris chaud).

export const bouton = {
  principal:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-tomate-600 px-4 font-bold text-white hover:bg-tomate-700 disabled:cursor-not-allowed disabled:opacity-50',
  secondaire:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 font-bold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-tomate-200 bg-white px-4 font-bold text-tomate-800 hover:bg-tomate-50 disabled:cursor-not-allowed disabled:opacity-50',
  lien: 'font-semibold text-tomate-700 underline underline-offset-2 hover:text-tomate-900',
}

export const champ =
  'min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 placeholder:text-gray-500 focus:border-gray-900'

export const etiquette = 'mb-1 block text-sm font-semibold text-gray-800'
