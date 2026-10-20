// Tests automatiques des règles métier.
// Lancer avec : npm test
// Chaque "it" décrit un comportement attendu ; "expect" vérifie le résultat.

import { describe, it, expect } from 'vitest'
import { estDansLeBudget, trouverPlafond, verifierBudget } from '../src/utils/budget.js'
import { departementDepuisCodePostal } from '../src/utils/departement.js'
import { filtrerRestaurants, normaliser, compterFiltresActifs, FILTRES_PAR_DEFAUT } from '../src/utils/filtres.js'
import { statistiquesNotes, formaterNote } from '../src/utils/notes.js'
import { distanceKm, restaurantsDansLeRayon } from '../src/utils/geolocalisation.js'
import { analyserAdresse } from '../api/rechercher-restaurant.js'
import { styleCuisine } from '../src/config/cuisines.js'

const plafonds = [
  { departement: '60', nom: 'Oise', plafond: 40 },
  { departement: '93', nom: 'Seine-Saint-Denis', plafond: 35 },
]

const restaurants = [
  { id: 1, nom: 'Le Relais', ville: 'Lamorlaye', cuisine: 'Français', departement: '60', prixMoyen: 28 },
  { id: 2, nom: 'Le Grand Cerf', ville: 'Compiègne', cuisine: 'Français', departement: '60', prixMoyen: 48 },
  { id: 3, nom: 'O Cantinho', ville: 'Villemomble', cuisine: 'Portugais', departement: '93', prixMoyen: 19 },
  { id: 4, nom: 'Sans plafond', ville: 'Lyon', cuisine: 'Autre', departement: '69', prixMoyen: 10 },
]

describe('Règle du budget', () => {
  it('trouve le plafond du département', () => {
    expect(trouverPlafond('60', plafonds)).toBe(40)
    expect(trouverPlafond('69', plafonds)).toBeNull()
  })

  it('valide un restaurant sous ou égal au plafond', () => {
    expect(estDansLeBudget(restaurants[0], plafonds)).toBe(true)
    expect(estDansLeBudget({ ...restaurants[0], prixMoyen: 40 }, plafonds)).toBe(true)
  })

  it('refuse un restaurant au-dessus du plafond ou sans plafond', () => {
    expect(estDansLeBudget(restaurants[1], plafonds)).toBe(false)
    expect(estDansLeBudget(restaurants[3], plafonds)).toBe(false)
  })

  it("contrôle le budget à l'ajout avec un message clair", () => {
    expect(verifierBudget('60', 30, plafonds).ok).toBe(true)
    const refus = verifierBudget('60', 45, plafonds)
    expect(refus.ok).toBe(false)
    expect(refus.message).toContain('Hors budget')
    expect(verifierBudget('69', 10, plafonds).ok).toBe(false)
    expect(verifierBudget('60', '', plafonds).ok).toBe(false)
  })
})

describe('Département depuis le code postal', () => {
  it.each([
    ['60260', '60'],
    ['75012', '75'],
    ['97400', '974'],
    ['20000', '2A'],
    ['20200', '2B'],
    ['123', null],
    ['', null],
  ])('%s → %s', (cp, attendu) => {
    expect(departementDepuisCodePostal(cp)).toBe(attendu)
  })
})

describe('Recherche et filtres', () => {
  const ctx = { plafonds, stats: { 1: { moyenne: 4.5, nombre: 2 }, 3: { moyenne: 3.5, nombre: 1 } }, favoris: new Set([3]) }
  const filtrer = (f) => filtrerRestaurants(restaurants, { ...FILTRES_PAR_DEFAUT, ...f }, ctx).map((r) => r.id)

  it('ignore les accents et les majuscules', () => {
    expect(normaliser('Français')).toBe('francais')
    expect(filtrer({ texte: 'compiegne' })).toEqual([2])
    expect(filtrer({ texte: 'PORTUGAIS' })).toEqual([3])
  })

  it('combine plusieurs mots', () => {
    expect(filtrer({ texte: 'francais lamorlaye' })).toEqual([1])
  })

  it('filtre par cuisine, département et prix', () => {
    expect(filtrer({ cuisine: 'Français' })).toEqual([1, 2])
    expect(filtrer({ departement: '93' })).toEqual([3])
    expect(filtrer({ budgetMax: 20 })).toEqual([3, 4])
  })

  it('filtre "dans le plafond" uniquement', () => {
    expect(filtrer({ dansLePlafond: true })).toEqual([1, 3])
  })

  it('filtre par note minimale et par favoris', () => {
    expect(filtrer({ noteMin: 4 })).toEqual([1])
    expect(filtrer({ favorisSeulement: true })).toEqual([3])
  })

  it('compte les filtres actifs', () => {
    expect(compterFiltresActifs(FILTRES_PAR_DEFAUT)).toBe(0)
    expect(compterFiltresActifs({ ...FILTRES_PAR_DEFAUT, cuisine: 'Italien', noteMin: 4 })).toBe(2)
  })
})

describe('Notes', () => {
  it('calcule la moyenne et le nombre d’avis par restaurant', () => {
    const stats = statistiquesNotes([
      { restaurantId: 1, note: 5 },
      { restaurantId: 1, note: 4 },
      { restaurantId: 1, note: 4 },
      { restaurantId: 2, note: 3 },
    ])
    expect(stats[1]).toEqual({ moyenne: 4.3, nombre: 3 })
    expect(stats[2]).toEqual({ moyenne: 3, nombre: 1 })
  })

  it('formate la note à la française', () => {
    expect(formaterNote(4.25)).toBe('4,3')
    expect(formaterNote(null)).toBe('–')
  })
})

describe('Types de restaurant personnalisés', () => {
  it('utilise la couleur et le pictogramme configurés', () => {
    const style = styleCuisine('Libanais', [{ nom: 'Libanais', couleur: '#d85b32', icone: 'pizza' }])
    expect(style.couleur).toBe('#d85b32')
    expect(style.icone).toBe('pizza')
    expect(style.traits).toEqual(styleCuisine('Italien').traits)
  })

  it('garde un style de repli pour un type inconnu', () => {
    expect(styleCuisine('Cuisine inconnue').traits).toEqual(styleCuisine('Autre').traits)
  })
})

describe('Roulette géolocalisée', () => {
  it('calcule la distance entre deux positions', () => {
    expect(distanceKm({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8666, lng: 2.3522 })).toBeCloseTo(1.112, 2)
  })

  it('ne garde que les restaurants publiés dans le rayon et les trie par distance', () => {
    const position = { lat: 49, lng: 2 }
    const resultats = restaurantsDansLeRayon(
      [
        { id: 1, statut: 'valide', lat: 49.015, lng: 2 },
        { id: 2, statut: 'valide', lat: 49.005, lng: 2 },
        { id: 3, statut: 'en_attente', lat: 49, lng: 2 },
        { id: 4, statut: 'valide', lat: 49.1, lng: 2 },
      ],
      position,
      2,
    )

    expect(resultats.map((restaurant) => restaurant.id)).toEqual([2, 1])
  })

  it('ignore les restaurants sans coordonnées', () => {
    expect(restaurantsDansLeRayon([{ id: 1, statut: 'valide' }], { lat: 49, lng: 2 }, 10)).toEqual([])
  })
})

describe('Adresse Google', () => {
  it('extrait rue, ville et code postal', () => {
    const composants = [
      { longText: '12', types: ['street_number'] },
      { longText: 'Rue de Chantilly', types: ['route'] },
      { longText: 'Lamorlaye', types: ['locality', 'political'] },
      { longText: '60260', types: ['postal_code'] },
    ]
    expect(analyserAdresse(composants)).toEqual({ adresse: '12 Rue de Chantilly', ville: 'Lamorlaye', codePostal: '60260' })
  })
})
