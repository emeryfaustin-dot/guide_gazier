# Mise en production — pas à pas

Ce guide te fait passer du **mode démo** (données dans ton navigateur) à la **vraie application**
partagée avec les collègues. Compte environ 1 h la première fois.

Ordre conseillé : **1. Supabase → 2. Google Places → 3. GitHub → 4. Vercel**.

---

## 1. Supabase (base de données + accès invité)

### Créer le projet
1. Va sur https://supabase.com → **Start your project** → connecte-toi (avec GitHub, c'est le plus simple).
2. **New project** : nom `guide-gazier`, mot de passe de base (garde-le dans un gestionnaire de mots de passe),
   région **West EU (Paris)** ou **Central EU (Frankfurt)**.
3. Attends 1 à 2 minutes que le projet soit prêt.

### Créer les tables
1. Menu de gauche → **SQL Editor** → **New query**.
2. Copie-colle **tout** le fichier `supabase/schema.sql` → **Run**. Tu dois voir « Success ».
3. Nouvelle requête : copie-colle `supabase/donnees-initiales.sql` → **Run**
   (plafonds + 10 restaurants d'exemple ; tu pourras les supprimer depuis les réglages partagés).

### Brancher l'app
1. **Project Settings** (roue crantée) → **API**.
2. Copie **Project URL** et la clé **anon public**.
3. Dans ton dossier projet, copie `.env.example` en `.env` et remplis :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Relance `npm run dev` : le badge **DÉMO** disparaît.

> La clé « anon » est publique par nature (elle part dans le navigateur). Ce qui protège les données,
> ce sont les **règles RLS** du fichier `schema.sql` : les sessions invitées peuvent modifier
> les réglages partagés, et chaque session ne peut modifier que ses propres avis.

### Activer l'accès invité
Dans **Authentication → Sign In / Providers**, active **Allow anonymous sign-ins**.
L'application crée ensuite une session invitée automatiquement, sans demander d'adresse email ni de mot de passe.

### Mettre à jour une base déjà installée
Après le déploiement de la nouvelle version, ouvre **SQL Editor** et exécute le fichier
`supabase/migrations/20261019_acces_partage.sql`, puis `supabase/migrations/20261020_session_invitee.sql`.
Exécute ensuite `supabase/migrations/20261021_types_cuisine.sql` pour ajouter la gestion partagée
des types de restaurant, leurs couleurs et leurs pictogrammes. Les réglages se font dans
**Réglages → Types et logos**; seules les icônes proposées par l'application sont disponibles.
Enfin, exécute `supabase/migrations/20261021_halal.sql` pour ajouter le badge « Halal »
(à cocher à l'ajout ou dans **Réglages → Restaurants**).

---

## 2. Google Places (ajout automatique des restaurants)

### Créer la clé
1. Va sur https://console.cloud.google.com → crée un projet `guide-gazier`.
2. **Facturation** : Google exige une carte bancaire, même pour rester dans la partie gratuite.
3. **APIs & Services → Library** → cherche **Places API (New)** → **Enable**.
   (⚠️ Bien la version « New », pas l'ancienne « Places API ».)
4. **APIs & Services → Credentials → Create credentials → API key**.
5. Clique sur la clé → **Restrictions** :
   - *API restrictions* → **Restrict key** → coche uniquement **Places API (New)**.
   - *Application restrictions* : laisse **None**. La clé est utilisée par le serveur Vercel,
     pas par le navigateur ; la protection vient du fait qu'elle n'est **jamais** envoyée au navigateur.
6. Ajoute-la dans `.env` (sans préfixe `VITE_`, c'est volontaire : elle reste secrète) :
   ```
   GOOGLE_PLACES_API_KEY=AIza...
   ```

### Limiter les coûts (important)
Google facture à l'appel, avec un **quota gratuit chaque mois par type d'appel** (en 2026, de l'ordre de
10 000 appels « Essentials », 5 000 « Pro » et 1 000 « Enterprise » ; vérifie sur la page tarifs Google).

Ce que fait déjà l'app pour rester économe :
- Elle ne demande **que les champs utiles** (« FieldMask ») : la recherche reste en catégorie « Pro ».
- La recherche n'est lancée **que sur clic** (pas à chaque lettre tapée).
- Les fonctions `/api` refusent les appels sans session invitée valide.
- La fiche relit téléphone, horaires, site et photo chez Google. Ces champs sont en catégorie « Enterprise »,
  la plus chère : c'est le poste à surveiller si l'app est très utilisée.

Ce que tu dois régler toi-même dans Google Cloud :
1. **Plafond d'appels** : APIs & Services → Places API (New) → **Quotas** → baisse
   « Requests per day » (ex. **200 par jour**). Au-delà, Google refuse : pas de facture surprise.
   L'app bascule alors sur la saisie manuelle et les infos enregistrées.
2. **Alerte budget** : Facturation → **Budgets & alerts** → budget de **5 €/mois**
   avec alertes email à 50 %, 90 % et 100 %.

### Conditions d'utilisation Google (ce que fait l'app)
- On stocke le **place_id** (autorisé sans limite de durée).
- On ne copie **pas** téléphone, horaires, site ni photo : ils sont relus en direct à l'ouverture de la fiche.
- Nom, adresse et coordonnées GPS sont gardés pour la carte et le contrôle du budget.
  Les règles Google limitent la conservation des coordonnées (30 jours au moment où ce guide est écrit) :
   piste d'amélioration, un bouton dans les réglages « rafraîchir depuis Google ».
- La mention « Infos fournies par Google » et l'auteur de la photo sont affichés.

---

## 3. GitHub (sauvegarde du code)

1. Crée un compte sur https://github.com puis un dépôt **privé** `guide-gazier`.
2. Dans le dossier du projet :
   ```bash
   git init
   git add .
   git commit -m "Guide du gazier : phases 1 à 7"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/guide-gazier.git
   git push -u origin main
   ```
3. Vérifie sur GitHub que **`.env` n'apparaît PAS** (il est exclu par `.gitignore`).

---

## 4. Vercel (mise en ligne)

1. https://vercel.com → **Sign up with GitHub**.
2. **Add New → Project** → importe le dépôt `guide-gazier`. Vercel détecte Vite tout seul.
3. **Environment Variables** : ajoute les **3** variables de ton `.env`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GOOGLE_PLACES_API_KEY`).
4. **Deploy**. Après 1 minute, tu as une adresse du type `https://guide-gazier.vercel.app`.
5. Vérifie dans **Supabase → Authentication → Sign In / Providers** que **Allow anonymous sign-ins** est toujours activé.
6. Sur ton téléphone, ouvre l'adresse puis **Partager → Sur l'écran d'accueil** : l'app s'ouvre comme une appli.

À chaque `git push`, Vercel remet automatiquement l'app à jour.

---

## Vérifications finales (checklist)

- [ ] `npm test` : tous les tests passent
- [ ] L'application s'ouvre sans demander d'email ni de mot de passe
- [ ] Un visiteur peut ouvrir les Réglages et modifier les plafonds partagés
- [ ] Une proposition apparaît dans Réglages → Propositions, puis sur la carte après validation collective
- [ ] Un restaurant au-dessus du plafond est refusé à l'ajout
- [ ] Modifier un plafond change immédiatement les badges sur la carte
- [ ] La recherche Google fonctionne, et la saisie manuelle prend le relais si Google est coupé
- [ ] Quota Google et alerte budget configurés

## Installer l'app sur le téléphone

L'app est une **PWA** (application web installable) : `public/manifest.webmanifest`,
`public/sw.js` et les icônes `public/icone-*.png`. Elle se met à jour toute seule à chaque déploiement Vercel.

- **Android (Chrome)** : ouvrir l'adresse Vercel → menu ⋮ → **Installer l'application**.
- **iPhone (Safari)** : bouton Partager → **Sur l'écran d'accueil**.

### Obtenir un fichier .apk (facultatif)
1. Aller sur https://www.pwabuilder.com et coller l'adresse Vercel du site.
2. **Package For Stores** → **Android** → **Generate Package** → télécharger le .zip.
3. Le .zip contient un `.apk` : l'envoyer sur le téléphone et l'ouvrir
   (autoriser « Installer des applis inconnues » pour le navigateur ou le gestionnaire de fichiers).
4. Garder précieusement le fichier `signing.keystore` et `signing-key-info.txt` du .zip :
   ils sont nécessaires pour publier une mise à jour du même APK.

L'APK n'est qu'une « coquille » qui ouvre le site : pas besoin de le regénérer quand on modifie l'app.
