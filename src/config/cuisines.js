// Liste des types de cuisine proposés dans les filtres et le formulaire d'ajout.
// Pour en ajouter un, il suffit de compléter ce tableau ET l'objet STYLES_CUISINES ci-dessous.
export const CUISINES = ['Rapide', 'Français', 'Japonais', 'Portugais', 'Italien', 'Autre']

// Options du filtre "budget max" (en € par personne). null = pas de limite.
export const OPTIONS_BUDGET = [null, 15, 20, 25, 30, 40, 50]

// Options du filtre "note minimale". null = toutes les notes.
export const OPTIONS_NOTE = [null, 3, 3.5, 4, 4.5]

// Identité visuelle de chaque cuisine : une couleur + un pictogramme.
// - couleur : fond du pin / de la vignette
// - encre   : couleur du pictogramme posé dessus (contraste AA vérifié)
// - texte   : couleur pour écrire le nom de la cuisine sur fond clair
// - traits  : tracés SVG du pictogramme (grille 24 × 24, trait sans remplissage)
export const STYLES_CUISINES = {
  Français: {
    couleur: '#7a2638',
    encre: '#ffffff',
    texte: '#7a2638',
    clair: '#f3e3e6',
    idee: 'verre de vin',
    traits: ['M7 3h10l-.6 5.5a4.4 4.4 0 0 1-8.8 0z', 'M12 13v7', 'M8 21h8'],
  },
  Japonais: {
    couleur: '#23395b',
    encre: '#ffffff',
    texte: '#23395b',
    clair: '#e1e7f0',
    idee: 'bol et baguettes',
    traits: ['M3 12h18a9 8 0 0 1-18 0z', 'M9 21h6', 'M14 9l6-6', 'M10.5 9l5-6'],
  },
  Rapide: {
    couleur: '#e8a317',
    encre: '#2b1e00',
    texte: '#7a5200',
    clair: '#fbf0d6',
    idee: 'burger',
    traits: ['M4 11a8 6.5 0 0 1 16 0z', 'M3 14.5h18', 'M5 17.5v.5a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-.5z'],
  },
  Portugais: {
    couleur: '#1d6f86',
    encre: '#ffffff',
    texte: '#17596b',
    clair: '#dcedf1',
    idee: 'sardine',
    traits: ['M2.5 12c3.5-5.5 10.5-6 14.5 0-4 6-11 5.5-14.5 0z', 'M17 12l4.5-3.5v7z', 'M7.5 11.2v.1'],
  },
  Italien: {
    couleur: '#2f7a4d',
    encre: '#ffffff',
    texte: '#24613d',
    clair: '#e0eee5',
    idee: 'part de pizza',
    traits: ['M3 6.5c6-3.3 12-3.3 18 0L12 21z', 'M10 10.5v.1', 'M14 12.5v.1', 'M11.5 15v.1'],
  },
  Autre: {
    couleur: '#5c4f86',
    encre: '#ffffff',
    texte: '#5c4f86',
    clair: '#e9e5f2',
    idee: 'couverts',
    traits: ['M6 3v5.5a2 2 0 0 0 4 0V3', 'M8 10.5V21', 'M18 3c-2.2 1-3.5 4-3.5 7.5H18V21'],
  },
}

// Renvoie le style d'une cuisine ; une cuisine inconnue prend le style « Autre ».
export function styleCuisine(cuisine) {
  return STYLES_CUISINES[cuisine] ?? STYLES_CUISINES.Autre
}
