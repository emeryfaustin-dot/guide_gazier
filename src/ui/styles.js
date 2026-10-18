// Classes Tailwind réutilisées partout : un seul endroit pour changer le style des boutons et champs.
// min-h-11 = 44 px de haut : taille minimale recommandée pour une cible tactile.

export const bouton = {
  principal:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50',
  secondaire:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50',
  lien: 'font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-950',
}

export const champ =
  'min-h-11 w-full rounded-lg border border-gray-400 bg-white px-3 text-base text-gray-900 placeholder:text-gray-500'

export const etiquette = 'mb-1 block text-sm font-semibold text-gray-800'
