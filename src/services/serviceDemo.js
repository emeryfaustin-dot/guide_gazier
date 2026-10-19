// Service de données "démo" : même fonctions que serviceSupabase,
// mais tout est enregistré dans le navigateur (localStorage).
// Utile pour tester l'app sans compte Supabase. Les données ne sont
// visibles que sur CE navigateur.

import restaurantsInitiaux from '../data/restaurants.json'
import plafondsInitiaux from '../data/plafonds.json'
import avisInitiaux from '../data/avis-demo.json'
import { verifierBudget } from '../utils/budget.js'

const CLE_DONNEES = 'guide-gazier-demo-donnees-v1'
const CLE_UTILISATEUR = 'guide-gazier-demo-utilisateur-v1'

// --- Lecture / écriture prudentes (le stockage peut être bloqué, ex. navigation privée) ---
function lire(cle, valeurParDefaut) {
  try {
    const brut = localStorage.getItem(cle)
    return brut ? JSON.parse(brut) : valeurParDefaut
  } catch {
    return valeurParDefaut
  }
}
function ecrire(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    // Pas grave : en démo, les données seront simplement perdues au rechargement.
  }
}

// Base en mémoire, initialisée depuis le stockage ou depuis les fichiers JSON.
// structuredClone = copie complète, pour ne jamais modifier les fichiers JSON d'origine.
const baseInitiale = () =>
  structuredClone({
    restaurants: restaurantsInitiaux,
    plafonds: plafondsInitiaux,
    avis: avisInitiaux,
    favoris: {}, // { [utilisateurId]: [restaurantId, ...] }
  })

let base = lire(CLE_DONNEES, null) ?? baseInitiale()
const sauver = () => ecrire(CLE_DONNEES, base)

let ecouteurs = []
const prevenir = (u) => ecouteurs.forEach((cb) => cb(u))

const nouvelId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

export const serviceDemo = {
  mode: 'demo',

  async obtenirUtilisateur() {
    return lire(CLE_UTILISATEUR, null)
  },

  surChangementSession(callback) {
    ecouteurs.push(callback)
    return () => (ecouteurs = ecouteurs.filter((cb) => cb !== callback))
  },

  // En démo, chaque collègue entre avec son adresse email.
  async connexion({ email }) {
    const utilisateur = { id: `demo-${email.toLowerCase()}`, email, prenom: '' }
    ecrire(CLE_UTILISATEUR, utilisateur)
    prevenir(utilisateur)
    return { lienEnvoye: false }
  },

  async deconnexion() {
    try {
      localStorage.removeItem(CLE_UTILISATEUR)
    } catch {
      /* ignoré */
    }
    prevenir(null)
  },

  async modifierPrenom(utilisateur, prenom) {
    const maj = { ...utilisateur, prenom }
    ecrire(CLE_UTILISATEUR, maj)
    // Le prénom affiché sur ses avis suit le profil (comme le trigger SQL côté Supabase).
    base.avis = base.avis.map((a) => (a.auteurId === utilisateur.id ? { ...a, prenom } : a))
    sauver()
    prevenir(maj)
  },

  async jetonAcces() {
    return null
  },

  async chargerTout(_utilisateur) {
    return {
      restaurants: structuredClone(base.restaurants),
      plafonds: structuredClone(base.plafonds),
      avis: structuredClone(base.avis).sort((a, b) => b.creeLe.localeCompare(a.creeLe)),
      favoris: new Set(utilisateur ? (base.favoris[utilisateur.id] ?? []) : []),
    }
  },

  async basculerFavori(utilisateur, restaurantId, devientFavori) {
    const liste = new Set(base.favoris[utilisateur.id] ?? [])
    if (devientFavori) liste.add(restaurantId)
    else liste.delete(restaurantId)
    base.favoris[utilisateur.id] = [...liste]
    sauver()
  },

  async enregistrerAvis(utilisateur, { restaurantId, note, commentaire }) {
    const existant = base.avis.find((a) => a.restaurantId === restaurantId && a.auteurId === utilisateur.id)
    if (existant) {
      Object.assign(existant, { note, commentaire, prenom: utilisateur.prenom, modifieLe: new Date().toISOString() })
    } else {
      base.avis.push({
        id: nouvelId(),
        restaurantId,
        auteurId: utilisateur.id,
        prenom: utilisateur.prenom,
        note,
        commentaire,
        creeLe: new Date().toISOString(),
      })
    }
    sauver()
  },

  async supprimerAvis(utilisateur, avisId) {
    const avis = base.avis.find((a) => a.id === avisId)
    if (!avis) return
    if (avis.auteurId !== utilisateur.id) throw new Error('Tu ne peux supprimer que tes propres avis.')
    base.avis = base.avis.filter((a) => a.id !== avisId)
    sauver()
  },

  async proposerRestaurant(utilisateur, r) {
    // Même contrôle que le trigger SQL : la base refuse un restaurant hors budget.
    const controle = verifierBudget(r.departement, r.prixMoyen, base.plafonds)
    if (!controle.ok) throw new Error(controle.message)

    const nouveau = {
      ...r,
      id: Math.max(0, ...base.restaurants.map((x) => Number(x.id) || 0)) + 1,
      statut: 'en_attente',
      proposePar: utilisateur.id,
      creeLe: new Date().toISOString(),
    }
    base.restaurants.push(nouveau)
    sauver()
    return nouveau
  },

  async changerStatutRestaurant(_utilisateur, id, statut) {
    const r = base.restaurants.find((x) => x.id === id)
    if (r) r.statut = statut
    sauver()
  },

  async supprimerRestaurant(_utilisateur, id) {
    base.restaurants = base.restaurants.filter((x) => x.id !== id)
    base.avis = base.avis.filter((a) => a.restaurantId !== id)
    sauver()
  },

  async enregistrerPlafond(_utilisateur, { departement, nom, plafond }) {
    const existant = base.plafonds.find((p) => p.departement === departement)
    if (existant) Object.assign(existant, { nom, plafond })
    else base.plafonds.push({ departement, nom, plafond })
    base.plafonds.sort((a, b) => a.departement.localeCompare(b.departement))
    sauver()
  },

  async supprimerPlafond(_utilisateur, departement) {
    base.plafonds = base.plafonds.filter((p) => p.departement !== departement)
    sauver()
  },

  // Remet les données de démonstration à zéro (bouton dans le profil).
  async reinitialiser() {
    base = baseInitiale()
    sauver()
  },
}
