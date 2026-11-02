# Déploiement et exploitation

Le site est une application Next.js 16 avec Payload CMS 3 (dossier `site/`). Elle a besoin de trois choses :
une base **PostgreSQL**, un **stockage de fichiers compatible S3** et un hébergeur Node (conteneur Docker ou plateforme Node).

## Variables d'environnement

Voir `site/.env.example`. En production, au minimum :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Chaîne de connexion Postgres |
| `PAYLOAD_SECRET` | Clé secrète longue et aléatoire (signature des sessions) |
| `NEXT_PUBLIC_SERVER_URL` | Adresse publique, ex. `https://www.pcrf-ic.fr` |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Stockage des médias (Cloudflare R2, Scaleway Object Storage, Cellar…) |
| `LEGACY_MEDIA_BASE_URL` | Adresse publique du dossier `migration/media` copié dans le bucket (les articles importés y font référence sous `/legacy-media/`) |
| `SMTP_*` | Envoi des mails « mot de passe oublié » (Brevo SMTP fonctionne) |

## Base de données : migrations

En développement, Payload adapte la base automatiquement (`push`). En production, on utilise des migrations versionnées :

```sh
cd site
pnpm payload migrate:create nom_du_changement   # à chaque modification des collections
pnpm payload migrate                            # à chaque déploiement, avant le démarrage
pnpm programme <pdf> <page1> <page2>            # une fois, après le seed : PDF du programme + pages d'aperçu (les fichiers sont dans reference/programme et migration/media/IMG/pdf)
```

## Construire et lancer

```sh
cd site
pnpm install --frozen-lockfile
pnpm build
pnpm start            # PORT=3000 par défaut
```

Le `Dockerfile` fourni produit une image autonome (`output: 'standalone'`). Commande de démarrage : `node server.js`.

### Hébergeurs testés ou prévus

- **Clever Cloud** (France) : application Node ou Docker + add-on PostgreSQL + Cellar (S3). Déploiement par `git push`.
- **Vercel** + Neon (Postgres) + R2 (fichiers) : gratuit au départ, serveurs en Europe possibles, société américaine.
- Tout hébergeur capable de lancer un conteneur Docker avec une base Postgres accessible.

## Déployer sur Vercel

Le dossier `site/` contient un `vercel.json` : commande de build `pnpm run ci` (migrations de la base, puis build) et
fonctions hébergées en région Paris (`cdg1`). Dans les réglages du projet Vercel, *Root Directory* doit valoir `site`.

1. **Base Postgres** : onglet *Storage* du projet › *Create Database* › Neon, région Europe. Vercel ajoute lui-même
   `DATABASE_URL` aux variables du projet.
2. **Fichiers** : créer un bucket R2 (Cloudflare) ou équivalent, puis renseigner `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`,
   `S3_ACCESS_KEY_ID` et `S3_SECRET_ACCESS_KEY` dans *Settings › Environment Variables*.
3. **Autres variables** : `PAYLOAD_SECRET` (chaîne aléatoire, par exemple `openssl rand -hex 32`), `NEXT_PUBLIC_SERVER_URL`
   (adresse publique du site), puis `LEGACY_MEDIA_BASE_URL` et `SMTP_*` quand ils sont prêts.
4. **Déployer** : *Deployments › Redeploy*, ou un push sur `main`. Le build exécute les migrations puis pré-rend les pages :
   il échoue tant que `DATABASE_URL` et `PAYLOAD_SECRET` manquent (« missing secret key »).
5. **Contenu** : depuis le poste local, avec les variables de la production passées sur la ligne de commande
   (elles priment sur le `.env` local) :

   ```sh
   cd site
   export DATABASE_URL='<celle de Neon>' PAYLOAD_SECRET='<celle de Vercel>' S3_BUCKET=… S3_ENDPOINT=… S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=…
   pnpm seed
   pnpm import:spip
   pnpm programme ../migration/media/IMG/pdf/programme_pcrf_a4_centre.pdf ../reference/programme/page-01.jpg ../reference/programme/page-03.jpg
   ```

   puis copier `migration/media` dans le bucket (voir ci-dessous). Les pages publiques se rafraîchissent d'elles-mêmes dans les
   5 minutes qui suivent.

## Médias de l'ancien site

Le dossier `migration/media` (images et PDF récupérés de SPIP) doit être copié tel quel dans le bucket, par exemple sous
`legacy/`, et `LEGACY_MEDIA_BASE_URL` pointe sur ce préfixe. Exemple avec rclone ou l'outil de l'hébergeur :

```sh
rclone copy migration/media remote:bucket/legacy
```

## Sauvegardes

- Base : `pg_dump` quotidien (la plupart des hébergeurs le proposent). Garder 30 jours.
- Fichiers : versioning activé sur le bucket, ou copie hebdomadaire vers un second bucket.
- Export complet « lisible » : `pnpm export:contenu` sort tous les articles et pages en HTML, plus les médias, dans `export/`.

## Surveillance

- Un test de disponibilité gratuit (UptimeRobot, Better Stack) sur `https://www.pcrf-ic.fr/` toutes les 5 minutes, alerte par mail.
- Google Search Console pour l'indexation.

## Mises à jour

Une fois par trimestre : `pnpm update` sur les paquets `payload`, `@payloadcms/*` et `next` (versions mineures), puis
`pnpm build`, test local, déploiement. Lire les notes de version de Payload avant un changement de version majeure.

## Comptes et transmission

- Le dépôt Git, le compte d'hébergement, le bucket et le nom de domaine doivent être au nom de l'association, avec au moins
  deux personnes ayant accès.
- Les comptes rédacteurs et administrateurs se gèrent dans `/admin` › Utilisateurs.
