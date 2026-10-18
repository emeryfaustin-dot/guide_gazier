# Guide du gazier

Guide interne des restaurants validés par les collègues GRTgaz, sur une carte.

## Démarrer (mode démo, sans aucun compte)

```bash
npm install     # une seule fois : installe les dépendances
npm run dev     # lance l'application
```

Ouvre http://localhost:5173. Sans fichier `.env`, l'app tourne en **mode démo** : les données
restent dans ton navigateur, et tu peux te connecter en « administrateur (démo) ».

## Passer en vrai (Supabase, Google, Vercel)

Suis le guide pas à pas : [`docs/MISE-EN-PRODUCTION.md`](docs/MISE-EN-PRODUCTION.md).

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | lancer en local |
| `npm test` | tests automatiques |
| `npm run lint` | vérifier la qualité du code |
| `npm run build` | construire la version de production |

Voir `CLAUDE.md` pour l'architecture, les règles et les choix techniques.
