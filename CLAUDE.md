# CLAUDE.md — Guide du gazier

> Ce fichier est lu par Claude au début de chaque session. Il résume le projet,
> la stack et les règles à respecter. Le tenir à jour à chaque évolution.

## Le projet
Application web **interne GRTgaz** : un « guide Michelin » des restaurants validés
par les collègues. Les agents (gaziers) déjeunent souvent au restaurant en
déplacement ; l'app leur permet de trouver vite les bonnes adresses, **sur une carte**.

Utilisateur principal : collègue sur le terrain, **sur téléphone** → conception mobile-first.
Propriétaire : Faustin (débutant en développement → expliquer simplement).

## Règle métier principale
- Chaque département a un **plafond de budget par personne** (ex. Oise = 40 €).
- Un restaurant est **« dans le budget »** si son prix moyen ≤ plafond de son département.
- Département sans plafond → **non validé** (par prudence).
- Plafonds dans une **table de configuration** (`plafonds` dans Supabase, `src/data/plafonds.json` en démo),
  modifiables par tout collègue connecté depuis les réglages, **jamais codés en dur**.
- Logique centralisée dans `src/utils/budget.js` (`trouverPlafond`, `estDansLeBudget`, `verifierBudget`).
- Contrôle **aussi côté base** : le trigger SQL `controler_budget` refuse un ajout hors budget.

## Deux concepts à ne pas confondre
- **Statut** d'un restaurant (décidé collectivement) : `en_attente` → `valide` (publié) ou `refuse`.
  Seuls les `valide` apparaissent sur la carte et la liste.
- **Budget** (calculé en direct) : badge « ✓ Dans le budget » / « ! Hors budget ».
  Un restaurant publié peut devenir « hors budget » si un collègue baisse le plafond.

## Fonctionnalités (toutes livrées)
1. Carte Leaflet + OpenStreetMap, pins colorés par cuisine (+ pastille « ! » si hors budget), popup → « Voir la fiche ».
2. Recherche (nom, ville, cuisine ; sans accents, multi-mots).
3. Filtres : cuisine, département, prix max, « dans le plafond », note minimale, favoris.
4. Vue Liste (triée par note).
5. Fiche : infos, itinéraire, téléphone cliquable, horaires, site, note moyenne, avis, photo Google.
6. Favoris par collègue.
7. Avis 1–5 + commentaire (prénom + date), un par personne et par restaurant, modifiable / supprimable.
8. Ajout : recherche Google Places (nom ou lien Google Maps) ou saisie manuelle + géocodage Nominatim.
9. Contrôle du budget à l'ajout (refus si dépassé). Chaque ajout est proposé « en attente », puis validé collectivement.
10. Réglages partagés : valider/refuser les propositions, gérer les plafonds, retirer/supprimer des restaurants.
11. Roulette : tirage au sort d'un restaurant publié dans le rayon GPS choisi.

## Charte visuelle (NaTran, ex-GRTgaz)
- Couleurs et polices déclarées UNE fois dans `src/index.css` (`@theme` Tailwind) :
  gris neutres (`gray-*` redéfini), `natran-*` = jaune NaTran (#fec52e) pour les actions, `ok` / `hors` = budget, `etoile`.
  Jaune trop clair pour du texte : boutons `bg-natran-400 text-gray-950`, liens/accents `text-natran-700`.
- En-tête : bandeau presque noir (`bg-gray-900`), logo `public/logo.png` + « Le guide du Gazier » en `text-natran-400`
  (le jaune vif n’est lisible que sur fond foncé) ; onglet actif jaune. Favicon `public/favicon.png`.
- Polices : **Bricolage Grotesque** (titres, classe `font-display`) + **Figtree** (texte), chargées dans `index.html`.
- Chaque cuisine a une couleur + un pictogramme : `STYLES_CUISINES` dans `src/config/cuisines.js`
  (utilisé par les pins, la liste, la fiche, la légende). Nouvelle cuisine → l'ajouter là.
- Types, couleurs et pictogrammes sont personnalisables dans Réglages → Types et logos
  (table Supabase `types_cuisine`, données locales en mode démo).
- Icônes : composant `src/ui/Icone.jsx` (SVG au trait). **Pas d'emoji** dans l'interface.

## Stack technique
- **React 19 + Vite 8**, **Tailwind CSS v4** (`@tailwindcss/vite`, import unique dans `src/index.css`)
- **Leaflet + react-leaflet 5** (tuiles OpenStreetMap, attribution obligatoire)
- **Supabase** (`@supabase/supabase-js`) : Postgres + RLS + session invitée automatique (aucun email demandé)
- **Fonctions serveur** `api/*.js` (format Vercel, Node) pour Google Places ; en local, servies par
  un petit plugin dans `vite.config.js`
- **Vitest** pour les tests ; **oxlint** pour la qualité
- **Vercel** pour le déploiement

## Mode démo
Si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sont absents, l'app utilise `serviceDemo.js`
(localStorage, données de `src/data/`). En démo, un profil invité est créé automatiquement.
Les deux services (`serviceSupabase.js`, `serviceDemo.js`) exposent **exactement les mêmes fonctions** :
toute nouvelle fonction doit être ajoutée aux deux.

## Arborescence
```
api/                         # fonctions serveur (Vercel) — clé Google ici seulement
  _outils.js                 # réponse JSON, vérif. du jeton Supabase, clé
  rechercher-restaurant.js   # Text Search (nom ou lien Google Maps)
  details-restaurant.js      # téléphone, horaires, site, photo (relus en direct)
supabase/
  schema.sql                 # tables, triggers, règles RLS
  migrations/                # évolutions pour une base déjà installée
  donnees-initiales.sql      # plafonds + 10 restaurants d'exemple
docs/MISE-EN-PRODUCTION.md   # Supabase, Google (clé + coûts), GitHub, Vercel
tests/regles.test.js         # tests des règles métier (npm test)
src/
  App.jsx                    # routes + mise en page
  config/cuisines.js         # listes (cuisines, options de filtres)
  contexte/DonneesContexte.jsx  # état global : utilisateur, données, executer(), notifier()
  hooks/useRoute.js          # navigation par #/… (bouton Retour du téléphone OK)
  hooks/useDetailsGoogle.js
  lib/supabase.js            # client Supabase (ou null en démo)
  services/donnees.js        # choisit Supabase ou démo
  services/serviceSupabase.js, serviceDemo.js, places.js, geocodage.js
  utils/budget.js, filtres.js, notes.js, departement.js, geolocalisation.js # logique pure, testée
  ui/                        # petits composants génériques + styles.js
  components/carte|recherche|liste|fiche|ajout|admin|layout/
  pages/                     # VueRestaurants, PageAjout, PageRoulette, réglages, PageProfil
```

## Modèle de données (côté app, camelCase)
- Restaurant : `id, nom, adresse, ville, codePostal, departement, cuisine, prixMoyen, telephone, horaires,
  siteWeb, lat, lng, placeId, statut, proposePar, creeLe` (base en snake_case, conversion dans serviceSupabase)
- Avis : `id, restaurantId, auteurId, prenom, note, commentaire, creeLe, modifieLe`
- Plafond : `departement, nom, plafond` · Favoris : Set d'ids · Profil : `id, prenom` (email facultatif)

## Règles de code
- Code et commentaires **en français**, commentaires simples.
- **Petits composants**, un par fichier ; logique métier dans `src/utils/` (fonctions pures + tests).
- Toute action qui modifie des données passe par `executer(action, messageSucces)` du contexte.
- Accessibilité : contrastes AA, cibles tactiles ≥ 44 px (`min-h-11`), libellés `<label>` reliés,
  info jamais portée **uniquement** par la couleur, `aria-live` pour les résultats et notifications.
- Dans les popups Leaflet : `<div>` plutôt que `<p>` (marges imposées par Leaflet).
- Carte : `animate: false` sur les recadrages (évite une erreur Leaflet au démontage).

## Sécurité & clés API
- Clés dans **`.env`** (jamais dans le code ni sur GitHub). Modèle : `.env.example`.
- `VITE_*` = visible dans le navigateur → seulement Supabase URL + clé anon (protégées par RLS).
- `GOOGLE_PLACES_API_KEY` **sans** `VITE_` → lue uniquement par `api/`, jamais envoyée au navigateur.
- `api/` vérifie le jeton Supabase de l'utilisateur avant d'appeler Google.
- Tous les comptes connectés partagent la gestion des propositions, des restaurants et des plafonds.
- Les sessions anonymes doivent être activées dans Supabase (Authentication → Sign In / Providers).

## Google Places — conditions d'utilisation
- Stocker le **`place_id`** ; téléphone/horaires/site/photo **relus en direct** (pas stockés).
- Afficher « Infos fournies par Google » + auteurs de la photo.
- FieldMask minimal, recherche sur clic uniquement ; quotas journaliers et alerte budget côté Google Cloud.

## Phases
- [x] Phase 1 : initialisation, CLAUDE.md, carte avec restaurants factices
- [x] Phase 2 : recherche + filtres
- [x] Phase 3 : fiche restaurant + design mobile
- [x] Phase 4 : Supabase (schéma + RLS) + session invitée automatique
- [x] Phase 5 : favoris, commentaires et notes
- [x] Phase 6 : ajout via Google Places + saisie manuelle + contrôle du budget
- [x] Phase 7 : réglages partagés, tests, guide de déploiement Vercel
- [x] Phase 8 : roulette géolocalisée et suppression du rôle administrateur

## Pistes d'amélioration
- Bouton « Rafraîchir depuis Google » dans les réglages (adresse/coordonnées des restaurants avec place_id).
- Modifier un restaurant (prix, cuisine) depuis les réglages partagés.
- Regroupement des marqueurs proches (leaflet.markercluster) quand il y aura beaucoup de restaurants.
- « Autour de moi » (géolocalisation du téléphone) et tri par distance.
- Mode hors-ligne / PWA installable.

## Commandes
- `npm install` : installer les dépendances
- `npm run dev` : lancer en local (http://localhost:5173 ; téléphone via l'adresse « Network » affichée)
- `npm test` : tests automatiques
- `npm run lint` : vérification de la qualité du code
- `npm run build` : version de production (dossier `dist/`)
