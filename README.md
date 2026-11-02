# Site du PCRF — refonte

- `site/` : le nouveau site (Next.js 16 + Payload CMS 3, base Postgres). Front public + espace de rédaction sur `/admin`.
- `migration/` : récupération du contenu de l'ancien site SPIP (voir `migration/README.md`).
- `reference/` : logo et bandeau de l'ancien site, pages d'aperçu du programme (utilisés par `pnpm seed` et `pnpm programme`).
- `contexte/` : brief du client (non versionné).

## Lancer en local

```sh
# 1. Base de données (Postgres 17 installé par Homebrew, données dans .pgdata)
./pg.sh start          # ./pg.sh stop pour arrêter

# 2. Node 22 récent (Payload exige >= 22.23) : installé par Homebrew sans toucher au Node global
export PATH=/opt/homebrew/opt/node@22/bin:$PATH

# 3. Site
cd site
pnpm install
pnpm dev               # http://localhost:3100  (admin : http://localhost:3100/admin)
```

## Données

```sh
cd site
pnpm import:spip       # importe migration/out + migration/media dans Payload (rejouable)
pnpm seed              # compte admin, logo, bandeau, menus, pages fixes (rejouable)
pnpm programme <pdf> <page1.jpg> <page2.jpg> [page3.jpg]   # installe le PDF du programme et ses pages d'aperçu dans la fenêtre d'accueil (rejouable)
pnpm cleanup:drafts    # supprime les brouillons sans titre
pnpm export:contenu    # export complet lisible (HTML + médias) dans ../export
pnpm screenshots       # captures d'écran du site local dans site/.screenshots
pnpm test:e2e          # tests de bout en bout (Playwright, site lancé sur 3100)
pnpm test:int          # tests d'intégration (vitest)
```

Documentation : `docs/guide-redacteur.md` (pour les rédacteurs), `docs/deploiement.md` (mise en production, sauvegardes).

Variables d'environnement : voir `site/.env.example`. En production : `DATABASE_URL`, `PAYLOAD_SECRET`,
`NEXT_PUBLIC_SERVER_URL`, stockage S3 (`S3_*`) et `LEGACY_MEDIA_BASE_URL` (adresse publique du dossier
`migration/media` copié dans le bucket).
