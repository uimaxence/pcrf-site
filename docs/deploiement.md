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
| `SMTP_*` | Envoi des mails : formulaires Contact et Nous rejoindre, « mot de passe oublié » (voir ci-dessous) |

## Envoi des mails (SMTP)

Sans `SMTP_HOST`, rien ne part : les formulaires Contact et « Nous rejoindre » répondent « L'envoi a échoué » et le
« mot de passe oublié » ne fonctionne pas. Le volume est faible (quelques dizaines de mails par mois) : le plan gratuit
de Brevo (déjà utilisé pour la lettre d'information, 300 mails par jour) suffit.

1. Dans Brevo : *Expéditeurs et IP › Expéditeurs* → ajouter et vérifier l'adresse d'envoi (par exemple `site@pcrf-ic.fr`,
   ou à défaut l'adresse Gmail du parti). Pour une adresse en `@pcrf-ic.fr`, authentifier le domaine (*Domaines* : Brevo
   donne trois enregistrements DNS — DKIM, Brevo-code, DMARC — à poser chez le registrar du nom de domaine).
2. Dans Brevo : *SMTP et API › SMTP* → créer une clé SMTP (la valeur n'est affichée qu'une fois : la copier tout de suite). L'onglet affiche aussi l'identifiant SMTP (de la forme `xxxxxxx001@smtp-brevo.com`). Le titulaire du compte peut transmettre ces deux valeurs sans donner accès au compte, et révoquer la clé à tout moment au même endroit.
3. Sur Vercel, *Settings › Environment Variables* (Production) :

   | Variable | Valeur |
   |---|---|
   | `SMTP_HOST` | `smtp-relay.brevo.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | l'identifiant SMTP affiché dans l'onglet SMTP de Brevo |
   | `SMTP_PASS` | la clé SMTP |
   | `SMTP_FROM` | l'adresse d'envoi vérifiée (ex. `site@pcrf-ic.fr`) |

4. Redéployer, puis tester le formulaire de contact. Les messages arrivent à l'adresse de **Réglages du site › Réseaux et
   contact** (contact, et une seconde adresse facultative pour « Nous rejoindre »).

Alternative sans Brevo : le SMTP de Gmail avec un « mot de passe d'application » (`smtp.gmail.com`, port `465`,
`SMTP_SECURE=true`, `SMTP_USER` et `SMTP_FROM` = l'adresse Gmail), limité à 500 mails par jour ; il faut la validation en
deux étapes sur le compte Google.

## Base de données : migrations

En développement, Payload adapte la base automatiquement (`push`). En production, on utilise des migrations versionnées :

```sh
cd site
pnpm payload migrate:create nom_du_changement   # à chaque modification des collections (voir l'avertissement ci-dessous)
pnpm payload migrate                            # à chaque déploiement, avant le démarrage
pnpm programme <pdf> <page1> <page2>            # une fois, après le seed : PDF du programme + pages d'aperçu (les fichiers sont dans reference/programme et migration/media/IMG/pdf)
pnpm portfolios [slug…]                         # galeries « Portfolio » de l'ancien site : télécharge les photos, les met dans Médias, ajoute la galerie aux articles
pnpm retours:novembre3                          # rubrique Goodies, sites des campagnes, page et menu « Nous rejoindre » (après pnpm portfolios)
pnpm retours:novembre4                          # fin de la rubrique « Informations » (pages Qui sommes-nous, Liens…), partis de l'ACE, « Nous rejoindre » dans le pied de page, un article par goodie
```

> **Attention : générer les migrations avec les variables `S3_*` définies.** Le plugin de stockage ajoute des colonnes à la
> table des médias (`prefix`, `_objectkey`) uniquement quand `S3_BUCKET` est renseigné. Sans lui, `migrate:create` produit un
> schéma sans ces colonnes, et la production échoue avec « column "prefix" does not exist ». En local, chargez d'abord
> `site/.env.neon.local` (ou exportez les `S3_*`), puis lancez `pnpm payload migrate:create`.

> **Attention : jouer les scripts de données en production avec `NODE_ENV=production`.** Lancé sans cette variable
> (`pnpm payload run …`, `pnpm retours:…`, `pnpm portfolios`), Payload est en mode développement : il « pousse » le schéma
> sur la base de production et inscrit une ligne `dev` dans la table `payload_migrations`. Au déploiement suivant,
> `pnpm payload migrate` pose alors une question interactive et le build Vercel reste bloqué en « Building ». Si cela
> arrive : `DELETE FROM payload_migrations WHERE name = 'dev';` sur la base, annuler le build, puis `vercel redeploy`.

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

## Archives de l'URCF (archives.pcrf-ic.fr)

L'ancien site de l'URCF (SPIP, 793 articles) n'est plus un site dynamique : c'est une **copie figée** servie par un projet
Vercel séparé (`pcrf-archives`, dossier statique, sans base de données). Les anciennes adresses `spip.php?article123`
sont redirigées vers les pages figées par `middleware.js`. La recherche interne et les formulaires ont été retirés.

Reconstruire la copie (outillage dans `migration/archives-urcf/`) :

1. Aspirer le site d'origine avec `wget --mirror --convert-links --adjust-extension --page-requisites
   --restrict-file-names=windows` (voir les options exactes dans l'historique git de ce fichier), puis relancer `wget -i`
   sur les adresses tombées en erreur 503.
2. `python3 migration/archives-urcf/build.py <aspiration> <copie-ftp-de-IMG> <dossier-projet>` : exclut les fichiers
   étrangers à SPIP, ajoute les documents de `IMG/` absents de l'aspiration, neutralise les liens vers `urcf.fr` (domaine
   squatté), retire recherche et connexion, ajoute le bandeau d'avertissement et `404.html`.
3. Dans `<dossier-projet>` : `vercel deploy --prod --yes` (projet `pcrf-archives`). Le domaine `archives.pcrf-ic.fr` est
   rattaché à ce projet ; la zone DNS de `pcrf-ic.fr` est hébergée chez Vercel (`vercel dns ls pcrf-ic.fr`).

Les sauvegardes complètes des deux anciens sites Ouvaton (fichiers et export SQL du 14 novembre 2026) sont conservées
hors dépôt par le prestataire ; en demander une copie au besoin avant toute fermeture définitive d'Ouvaton.

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
