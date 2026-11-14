#!/usr/bin/env python3
"""Construit la copie figée (statique) du site des archives de l'URCF (archives.pcrf-ic.fr).

Entrées :
  - l'aspiration wget du site public (liens déjà convertis, `?` → `@` dans les noms de fichiers) ;
  - la copie FTP du dossier IMG/ du serveur (pour les documents que l'aspiration n'aurait pas atteints).
Sortie : un dossier `public/` prêt à être servi tel quel (Vercel), à côté de `vercel.json` et `middleware.js`.

Usage : python3 build.py <dossier-aspiration> <dossier-IMG-ftp> <dossier-projet>
"""
import html
import os
import re
import shutil
import sys
from pathlib import Path

if len(sys.argv) != 4:
    sys.exit(__doc__)
CRAWL, IMG_FTP, PROJECT = (Path(p).expanduser() for p in sys.argv[1:])
PUBLIC = PROJECT / 'public'
HERE = Path(__file__).resolve().parent

# Fichiers étrangers à SPIP (spam et scripts déposés par le piratage) : jamais copiés.
MALWARE = re.compile(r'(\.php\d?$|\.phtml$|\.phar$|^_files$|^tmp$|^remove\.txt$)')
SPAM_HTML = re.compile(r'^\d+\.html$')

BANDEAU = (
    '<div style="background:#b3161b;color:#fff;padding:10px 16px;font:15px/1.4 Arial,Helvetica,sans-serif;text-align:center">'
    'Archives du site de l’URCF, copie figée réalisée en novembre 2026. '
    'Le site actuel : <a href="https://pcrf-ic.fr" style="color:#fff;font-weight:bold">pcrf-ic.fr</a>'
    '</div>\n'
)

NOT_FOUND = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Page introuvable – Archives de l’URCF</title>
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:40em;margin:4em auto;padding:0 1em;color:#222">
<h1>Page introuvable</h1>
<p>Cette page n’existe pas dans les archives de l’URCF, ou n’a pas pu être conservée lors de la copie.</p>
<p><a href="/">Accueil des archives</a> · <a href="https://pcrf-ic.fr">Site du PCRF</a></p>
</body></html>
"""


def safe_name(name: str) -> str:
    """Nom de fichier sans `&` (gênant dans les adresses) : spip.php@rubrique76&debut_articles=40.html → …76_debut…"""
    return name.replace('&', '_')


def main() -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)

    # 1. L'aspiration, en excluant tout fichier douteux.
    copied = 0
    for src in CRAWL.rglob('*'):
        if not src.is_file():
            continue
        rel = src.relative_to(CRAWL)
        if any(MALWARE.search(part) for part in rel.parts) or SPAM_HTML.match(rel.name):
            continue
        dst = PUBLIC / Path(*[safe_name(p) for p in rel.parts])
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        copied += 1
    print(f'aspiration : {copied} fichiers copiés')

    # 2. Les documents du serveur (IMG/) absents de l'aspiration.
    added = 0
    for src in IMG_FTP.rglob('*'):
        if not src.is_file():
            continue
        rel = src.relative_to(IMG_FTP)
        if any(MALWARE.search(part) for part in rel.parts) or rel.suffix.lower() in ('.html', '.htm'):
            continue
        dst = PUBLIC / 'IMG' / rel
        if dst.exists():
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        added += 1
    print(f'IMG (ftp) : {added} documents ajoutés')

    # 3. Retouches des pages HTML.
    renamed = {}  # ancien nom (tel qu'écrit par wget) → nouveau nom
    for p in CRAWL.rglob('*'):
        if p.is_file() and '&' in p.name:
            renamed[p.name] = safe_name(p.name)

    re_urcf = re.compile(r'href="https?://(?:www\.)?urcf\.(?:fr|net)[^"]*"', re.I)
    re_form_recherche = re.compile(r'<form[^>]*page=recherche[^>]*>.*?</form>', re.S | re.I)
    re_login = re.compile(r'<a[^>]*href="[^"]*page=login[^"]*"[^>]*>.*?</a>', re.S | re.I)
    re_abs = re.compile(r'https?://archives\.pcrf-ic\.fr/')
    re_body = re.compile(r'(<body[^>]*>)', re.I)
    # Liens SPIP restés sous leur forme d'origine (pages récupérées après coup, plan du site…) :
    # spip.php?article249 → spip.php@article249.html quand ce fichier existe dans la copie.
    existing = {p.name for p in PUBLIC.glob('spip.php@*.html')}
    re_spip = re.compile(r'(href|src)="/?spip\.php\?([^"#]*)(#[^"]*)?"')

    def to_static(m: re.Match) -> str:
        query = html.unescape(m.group(2))
        name = f"spip.php@{safe_name(query)}.html"
        if name in existing:
            return f'{m.group(1)}="{name}{m.group(3) or ""}"'
        return m.group(0)

    stats = {'urcf': 0, 'recherche': 0, 'login': 0, 'pages': 0, 'spip': 0}
    for page in PUBLIC.rglob('*.html'):
        txt = page.read_text(encoding='utf-8', errors='replace')
        orig = txt
        for old, new in renamed.items():
            txt = txt.replace(html.escape(old, quote=False), new).replace(old, new)
        txt, n = re_urcf.subn('href="/" title="Ancien site de l’URCF, hors ligne"', txt)
        stats['urcf'] += n
        txt, n = re_form_recherche.subn('', txt)
        stats['recherche'] += n
        txt, n = re_login.subn('', txt)
        stats['login'] += n
        txt = re_abs.sub('/', txt)
        txt, n = re_spip.subn(to_static, txt)
        stats['spip'] += n
        txt = re_body.sub(r'\1\n' + BANDEAU, txt, count=1)
        if txt != orig:
            page.write_text(txt, encoding='utf-8')
            stats['pages'] += 1
    print(f"pages retouchées : {stats['pages']} (liens urcf.fr neutralisés : {stats['urcf']}, "
          f"formulaires de recherche retirés : {stats['recherche']}, liens de connexion retirés : {stats['login']}, "
          f"liens SPIP convertis après coup : {stats['spip']})")

    (PUBLIC / '404.html').write_text(NOT_FOUND, encoding='utf-8')
    for f in ('vercel.json', 'middleware.js'):
        shutil.copy2(HERE / f, PROJECT / f)

    total = sum(1 for p in PUBLIC.rglob('*') if p.is_file())
    size = sum(p.stat().st_size for p in PUBLIC.rglob('*') if p.is_file()) / 1e6
    print(f'public/ : {total} fichiers, {size:.0f} Mo → {PUBLIC}')


if __name__ == '__main__':
    main()
