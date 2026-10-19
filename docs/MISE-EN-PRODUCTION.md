# Mise en production — pas à pas

Ce guide te fait passer du **mode démo** (données dans ton navigateur) à la **vraie application**
partagée avec les collègues. Compte environ 1 h la première fois.

Ordre conseillé : **1. Supabase → 2. Google Places → 3. GitHub → 4. Vercel**.

---

## 1. Supabase (base de données + connexion par email)

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
> ce sont les **règles RLS** du fichier `schema.sql` : seuls les comptes connectés peuvent modifier
> les réglages partagés, et chacun ne peut modifier que ses propres avis.

### Régler la connexion par email
1. **Authentication** → **URL Configuration** :
   - **Site URL** : `http://localhost:5173` (tu la remplaceras par l'adresse Vercel à l'étape 4).
   - **Redirect URLs** : ajoute `http://localhost:5173/**`.
     Pour tester sur ton téléphone en local, ajoute aussi `http://192.168.*.*:5173/**`.
2. **Authentication** → **Sign In / Providers** → vérifie que **Email** est activé.
3. Attention : le service email gratuit de Supabase est limité à **quelques emails par heure**.
   Pour l'usage réel avec les collègues, branche un fournisseur SMTP
   (Authentication → Emails → SMTP Settings ; ex. Brevo ou Resend, gratuits pour un petit volume).

### Mettre à jour une base déjà installée
Après le déploiement de la nouvelle version, ouvre **SQL Editor** et exécute le fichier
`supabase/migrations/20261019_acces_partage.sql`. Il supprime le rôle administrateur et permet
à tout compte connecté de modifier les réglages et le statut des restaurants. Chaque ajout reste
en attente jusqu'à sa validation par un collègue.

### (Recommandé) Réserver l'app aux emails GRTgaz
```sql
insert into public.domaines_autorises (domaine) values ('grtgaz.com');
```
Ensuite, une adresse Gmail ou autre ne pourra plus créer de compte.

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
- Les fonctions `/api` refusent les appels des personnes **non connectées**.
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
5. Retourne dans **Supabase → Authentication → URL Configuration** :
   - **Site URL** = l'adresse Vercel,
   - ajoute `https://guide-gazier.vercel.app/**` dans les **Redirect URLs**.
6. Sur ton téléphone, ouvre l'adresse puis **Partager → Sur l'écran d'accueil** : l'app s'ouvre comme une appli.

À chaque `git push`, Vercel remet automatiquement l'app à jour.

---

## Vérifications finales (checklist)

- [ ] `npm test` : tous les tests passent
- [ ] Connexion par email OK (lien reçu, connexion sur le même appareil)
- [ ] Tout collègue connecté peut ouvrir les Réglages et modifier les plafonds
- [ ] Une proposition apparaît dans Réglages → Propositions, puis sur la carte après validation collective
- [ ] Un restaurant au-dessus du plafond est refusé à l'ajout
- [ ] Modifier un plafond change immédiatement les badges sur la carte
- [ ] La recherche Google fonctionne, et la saisie manuelle prend le relais si Google est coupé
- [ ] Quota Google et alerte budget configurés
