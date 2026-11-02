# Migration du contenu de www.pcrf-ic.fr

Outil de récupération du site SPIP actuel, sans accès à la base : tout passe par les pages publiques, à une requête par seconde (le robots.txt du site demande `Crawl-delay: 1`).

```
pnpm install
pnpm scrape   # 1. HTML brut de chaque page du sitemap -> raw/        (~17 min, reprise possible)
pnpm parse    # 2. raw/ -> out/articles.jsonl, rubriques.json, media-list.json, report.md (hors ligne)
pnpm media    # 3. télécharge les originaux (images, PDF) -> media/IMG/...  (long, reprise possible)
pnpm ids      # 4. table id SPIP -> slug via spip.php?articleN -> out/ids.json (~20 min)
```

`raw/`, `media/` et `logs/` ne sont pas versionnés. `out/` contient les données exploitables par le script d'import du nouveau site.
