// Service de données "réel" : lit et écrit dans la base Supabase.
// La sécurité (qui a le droit de faire quoi) est assurée côté base
// par les règles RLS du fichier supabase/schema.sql : même si quelqu'un
// modifie le code du navigateur, la base refuse les actions interdites.

import { supabase } from '../lib/supabase.js'

// ---------- Conversion base (snake_case) <-> application (camelCase) ----------

function versRestaurant(ligne) {
  return {
    id: ligne.id,
    nom: ligne.nom,
    adresse: ligne.adresse,
    ville: ligne.ville,
    codePostal: ligne.code_postal,
    departement: ligne.departement,
    cuisine: ligne.cuisine,
    prixMoyen: Number(ligne.prix_moyen),
    telephone: ligne.telephone,
    horaires: ligne.horaires,
    siteWeb: ligne.site_web,
    lat: ligne.lat,
    lng: ligne.lng,
    placeId: ligne.place_id,
    statut: ligne.statut,
    proposePar: ligne.propose_par,
    creeLe: ligne.cree_le,
  }
}

function versAvis(ligne) {
  return {
    id: ligne.id,
    restaurantId: ligne.restaurant_id,
    auteurId: ligne.auteur_id,
    prenom: ligne.prenom,
    note: ligne.note,
    commentaire: ligne.commentaire,
    creeLe: ligne.cree_le,
    modifieLe: ligne.modifie_le,
  }
}

// Petite aide : lève une erreur lisible si Supabase renvoie une erreur.
function verifier({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

// ---------- Authentification ----------

async function chargerProfil(user) {
  if (!user) return null
  const { data } = await supabase.from('profils').select('prenom, role').eq('id', user.id).maybeSingle()
  return {
    id: user.id,
    email: user.email,
    prenom: data?.prenom || user.user_metadata?.prenom || '',
    role: data?.role || 'agent',
  }
}

export const serviceSupabase = {
  mode: 'supabase',

  async obtenirUtilisateur() {
    const { data } = await supabase.auth.getSession()
    return chargerProfil(data.session?.user)
  },

  surChangementSession(callback) {
    const { data } = supabase.auth.onAuthStateChange((_evenement, session) => {
      // setTimeout : recommandé par Supabase pour éviter un blocage dans ce callback
      setTimeout(async () => callback(await chargerProfil(session?.user)), 0)
    })
    return () => data.subscription.unsubscribe()
  },

  // Connexion "lien magique" : Supabase envoie un email avec un lien de connexion.
  async connexion({ email, prenom }) {
    verifier(
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: { prenom }, // mémorisé à la création du compte (voir trigger SQL)
        },
      }),
    )
    return { lienEnvoye: true }
  },

  async deconnexion() {
    await supabase.auth.signOut()
  },

  async modifierPrenom(utilisateur, prenom) {
    verifier(await supabase.from('profils').update({ prenom }).eq('id', utilisateur.id))
  },

  async jetonAcces() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  },

  // ---------- Lecture ----------

  async chargerTout(utilisateur) {
    const [restaurants, plafonds, avis, favoris] = await Promise.all([
      supabase.from('restaurants').select('*').order('nom'),
      supabase.from('plafonds').select('*').order('departement'),
      supabase.from('avis').select('*').order('cree_le', { ascending: false }),
      utilisateur
        ? supabase.from('favoris').select('restaurant_id').eq('utilisateur_id', utilisateur.id)
        : Promise.resolve({ data: [] }),
    ])
    return {
      restaurants: verifier(restaurants).map(versRestaurant),
      plafonds: verifier(plafonds).map((p) => ({ ...p, plafond: Number(p.plafond) })),
      avis: verifier(avis).map(versAvis),
      favoris: new Set(verifier(favoris).map((f) => f.restaurant_id)),
    }
  },

  // ---------- Favoris ----------

  async basculerFavori(utilisateur, restaurantId, devientFavori) {
    if (devientFavori) {
      verifier(await supabase.from('favoris').insert({ utilisateur_id: utilisateur.id, restaurant_id: restaurantId }))
    } else {
      verifier(
        await supabase.from('favoris').delete().eq('utilisateur_id', utilisateur.id).eq('restaurant_id', restaurantId),
      )
    }
  },

  // ---------- Avis (un seul avis par personne et par restaurant) ----------

  async enregistrerAvis(utilisateur, { restaurantId, note, commentaire }) {
    // "upsert" = crée l'avis s'il n'existe pas, sinon le met à jour.
    // Le prénom et la date de modification sont remplis automatiquement par un trigger SQL.
    const ligne = verifier(
      await supabase
        .from('avis')
        .upsert(
          { restaurant_id: restaurantId, auteur_id: utilisateur.id, note, commentaire },
          { onConflict: 'restaurant_id,auteur_id' },
        )
        .select()
        .single(),
    )
    return versAvis(ligne)
  },

  async supprimerAvis(_utilisateur, avisId) {
    verifier(await supabase.from('avis').delete().eq('id', avisId))
  },

  // ---------- Restaurants ----------

  async proposerRestaurant(utilisateur, r) {
    const ligne = verifier(
      await supabase
        .from('restaurants')
        .insert({
          nom: r.nom,
          adresse: r.adresse,
          ville: r.ville,
          code_postal: r.codePostal,
          departement: r.departement,
          cuisine: r.cuisine,
          prix_moyen: r.prixMoyen,
          telephone: r.telephone || null,
          horaires: r.horaires || null,
          site_web: r.siteWeb || null,
          lat: r.lat,
          lng: r.lng,
          place_id: r.placeId || null,
          // Un admin publie directement ; les autres propositions attendent validation.
          statut: utilisateur.role === 'admin' ? 'valide' : 'en_attente',
          propose_par: utilisateur.id,
        })
        .select()
        .single(),
    )
    return versRestaurant(ligne)
  },

  async changerStatutRestaurant(_utilisateur, id, statut) {
    verifier(await supabase.from('restaurants').update({ statut }).eq('id', id))
  },

  async supprimerRestaurant(_utilisateur, id) {
    verifier(await supabase.from('restaurants').delete().eq('id', id))
  },

  // ---------- Plafonds (admin) ----------

  async enregistrerPlafond(_utilisateur, { departement, nom, plafond }) {
    verifier(await supabase.from('plafonds').upsert({ departement, nom, plafond }, { onConflict: 'departement' }))
  },

  async supprimerPlafond(_utilisateur, departement) {
    verifier(await supabase.from('plafonds').delete().eq('departement', departement))
  },
}
