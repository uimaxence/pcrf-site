// Étape 2 : transforme le HTML brut en JSON exploitable + rapport. Rejouable sans réseau.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { BASE, DIRS, writeJson } from './lib.mjs';

const clean = (u) => (u ? u.split('?')[0] : u);

// Vignette SPIP -> chemin probable de l'original.
// local/cache-vignettes/L640xH110/bandeau_photo_ic196-c42a2.jpg -> IMG/jpg/bandeau_photo_ic196.jpg
// local/cache-vignettes/L200xH34/arton942-1a2b3.png -> IMG/arton942.png (logo ancien format)
function guessOriginal(src) {
  if (!src) return null;
  const m = clean(src).match(/cache-vignettes\/L\d+xH\d+\/(.+?)-[0-9a-f]{5}\.(\w+)$/);
  if (!m) return null;
  const [, name, ext] = m;
  if (/^arton\d+$/.test(name) || /^siteon\d+$/.test(name)) return `IMG/${name}.${ext}`;
  return `IMG/${ext}/${name}.${ext}`;
}

// Candidats pour l'original d'un logo d'article (SPIP 4 range les logos dans IMG/logo/, les anciens en IMG/artonN.ext).
function logoCandidates(src) {
  if (!src) return [];
  const m = clean(src).match(/cache-vignettes\/L\d+xH\d+\/(.+?)-[0-9a-f]{5}\.(\w+)$/);
  if (!m) return [];
  const [, name, ext] = m;
  return [`IMG/logo/${name}.${ext}`, `IMG/${name}.${ext}`, `IMG/${ext}/${name}.${ext}`];
}

function parseArticle($, slug) {
  const $a = $('article').first();
  const head = $a.find('header.cartouche');
  const title = head.find('h1').text().replace(/\s+/g, ' ').trim();
  const time = head.find('time').first();
  const authors = head.find('.authors .vcard a').map((i, el) => ({ slug: $(el).attr('href') || null, name: $(el).text().trim() || null })).get();
  const crumbs = $('nav.nav-breadcrumb li a').map((i, el) => ({ slug: $(el).attr('href'), name: $(el).text().trim() })).get()
    .filter((c) => c.name !== 'Accueil');
  const logoThumb = clean(head.find('img.spip_logo').first().attr('src')) || null;
  const main = $a.find('.main').first();
  const sections = {};
  for (const k of ['chapo', 'texte', 'ps', 'notes']) {
    const el = main.find(`.${k}`).first();
    if (el.length) sections[k] = el.html().trim();
  }
  const documents = [];
  main.find('.spip_document').each((i, el) => {
    const $d = $(el);
    const a = $d.find('a.spip_doc_lien').first();
    const img = $d.find('img').first();
    documents.push({
      href: clean(a.attr('href')) || null,
      type: a.attr('type') || null,
      title: a.attr('title') || null,
      thumb: clean(img.attr('src')) || null,
      caption: $d.find('figcaption, .spip_doc_titre, .spip_doc_descriptif').text().replace(/\s+/g, ' ').trim() || null,
      classes: $d.attr('class') || '',
    });
  });
  const portfolio = $('#documents_portfolio a').map((i, el) => ({ href: clean($(el).attr('href')), type: $(el).attr('type') || null })).get();
  const iframes = main.find('iframe').map((i, el) => $(el).attr('src')).get();
  const links = main.find('a[href]').map((i, el) => $(el).attr('href')).get();
  const inlineImgs = main.find('img').map((i, el) => clean($(el).attr('src'))).get()
  const mediaFiles = main.find('video[src], video source[src], audio[src], audio source[src]').map((i, el) => clean($(el).attr('src'))).get();
  const text = main.text().replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const flags = {
    noLogo: !logoThumb,
    noDate: !time.attr('datetime'),
    empty: words < 10,
    hasIframe: iframes.length > 0,
    hasPdf: documents.some((d) => d.type === 'application/pdf') || links.some((l) => /\.pdf$/i.test(l || '')),
    hasTable: main.find('table').length > 0,
    hasStyleAttr: main.find('[style]').length > 0,
    hasRawImgNoLink: inlineImgs.some((s) => s && s.startsWith('local/cache-vignettes')) && documents.length === 0,
  };
  return {
    slug, url: BASE + slug, title,
    date: time.attr('datetime') || null, dateText: time.text().replace(/\s+/g, ' ').trim() || null,
    authors, rubriques: crumbs, topRubrique: crumbs[0]?.name || null,
    logoThumb, logoOriginalGuess: logoCandidates(logoThumb)[0] || null, logoCandidates: logoCandidates(logoThumb),
    sections, documents, portfolio, iframes, links, inlineImgs, mediaFiles, words, flags,
  };
}

function parseRubrique($, slug) {
  const crumbs = $('nav.nav-breadcrumb li a').map((i, el) => ({ slug: $(el).attr('href'), name: $(el).text().trim() })).get()
    .filter((c) => c.name !== 'Accueil');
  const active = $('nav.nav-breadcrumb li.active').first().text().replace(/\s+/g, ' ').trim();
  const title = active || $('title').text().split(' - ')[0].trim();
  return { slug, url: BASE + slug, title, parents: crumbs, description: null };
}

const files = fs.readdirSync(DIRS.raw).filter((f) => f.endsWith('.html')).sort();
const articles = [], rubriques = [], others = [];
for (const f of files) {
  const html = fs.readFileSync(path.join(DIRS.raw, f), 'utf8');
  const $ = cheerio.load(html);
  const canonical = $('link[rel=canonical]').attr('href');
  const slug = canonical ? new URL(canonical).pathname.replace(/^\/+/, '') : f.replace(/\.html$/, '');
  if (/^-.+-$/.test(slug)) rubriques.push(parseRubrique($, slug));
  else if ($('article header.cartouche').length) articles.push(parseArticle($, slug));
  else others.push({ slug, file: f, title: $('title').text().trim() });
}

// Liste des médias à récupérer : original probable + vignette de secours
const media = new Map();
const add = (p, fallback, from, kind = 'inline', alternates = []) => {
  if (!p || !p.startsWith('IMG/')) return;
  const e = media.get(p) || { path: p, fallback: fallback || null, from: [], kind, alternates };
  if (!e.fallback && fallback) e.fallback = fallback;
  if (kind === 'logo') e.kind = 'logo';
  if (e.from.length < 5) e.from.push(from);
  media.set(p, e);
};
for (const a of articles) {
  if (a.logoThumb && a.logoCandidates.length) add(a.logoCandidates[0], a.logoThumb, a.slug, 'logo', a.logoCandidates.slice(1));
  for (const d of a.documents) { add(d.href, d.thumb, a.slug, 'document'); }
  for (const s of a.inlineImgs) {
    if (!s) continue;
    if (s.startsWith('IMG/')) add(s, null, a.slug);
    else if (s.startsWith('local/cache-vignettes')) add(guessOriginal(s), s, a.slug);
  }
  for (const l of a.links) if (l && /^IMG\//.test(l)) add(clean(l), null, a.slug);
  for (const f of a.mediaFiles || []) if (f && f.startsWith('IMG/')) add(f, null, a.slug, 'document');
  for (const p of a.portfolio) add(p.href, null, a.slug);
}

writeJson(path.join(DIRS.out, 'rubriques.json'), rubriques);
writeJson(path.join(DIRS.out, 'others.json'), others);
fs.writeFileSync(path.join(DIRS.out, 'articles.jsonl'), articles.map((a) => JSON.stringify(a)).join('\n') + '\n');
const order = { logo: 0, document: 1, inline: 2 };
writeJson(path.join(DIRS.out, 'media-list.json'), [...media.values()].sort((a, b) => order[a.kind] - order[b.kind]));

// Rapport
const count = (arr, key) => { const m = {}; for (const x of arr) { const k = key(x) ?? '(aucun)'; m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((a, b) => b[1] - a[1]); };
const table = (rows, h1, h2) => [`| ${h1} | ${h2} |`, '|---|---|', ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join('\n');
const flagNames = ['noLogo', 'noDate', 'empty', 'hasIframe', 'hasPdf', 'hasTable', 'hasStyleAttr', 'hasRawImgNoLink'];
const flagRows = flagNames.map((f) => [f, articles.filter((a) => a.flags[f]).length]);
const examples = (f, n = 8) => articles.filter((a) => a.flags[f]).slice(0, n).map((a) => `  - ${a.slug}`).join('\n');
const docTypes = count(articles.flatMap((a) => a.documents), (d) => d.type);
const report = `# Rapport de collecte pcrf-ic.fr

Généré le ${new Date().toISOString().slice(0, 10)}.

- Fichiers HTML lus : ${files.length}
- Articles : ${articles.length}
- Rubriques : ${rubriques.length}
- Autres pages (auteurs, etc.) : ${others.length} ${others.map((o) => o.slug).join(', ')}
- Médias distincts référencés : ${media.size}
- Auteurs distincts : ${new Set(articles.flatMap((a) => a.authors.map((x) => x.slug))).size}
- Mots au total : ${articles.reduce((s, a) => s + a.words, 0)}

## Articles par rubrique de premier niveau
${table(count(articles, (a) => a.topRubrique), 'Rubrique', 'Articles')}

## Articles par chemin de rubrique complet
${table(count(articles, (a) => a.rubriques.map((r) => r.name).join(' > ')), 'Chemin', 'Articles')}

## Articles par année
${table(count(articles, (a) => (a.date || '').slice(0, 4)).sort(), 'Année', 'Articles')}

## Documents joints par type
${table(docTypes, 'Type', 'Nombre')}

## Points d'attention
${table(flagRows, 'Indicateur', 'Articles')}

### Exemples
- hasIframe (vidéos intégrées) :
${examples('hasIframe')}
- hasTable :
${examples('hasTable')}
- hasStyleAttr (mise en forme collée à la main) :
${examples('hasStyleAttr')}
- empty :
${examples('empty')}
- noDate :
${examples('noDate')}

## Rubriques
${rubriques.map((r) => `- ${r.title} (${r.slug})${r.parents.length ? ' sous ' + r.parents.map((p) => p.name).join(' > ') : ''}`).join('\n')}
`;
fs.writeFileSync(path.join(DIRS.out, 'report.md'), report);
console.log(report);
