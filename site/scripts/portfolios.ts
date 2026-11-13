/**
 * Portfolios de l'ancien site. SPIP affichait sous certains articles une galerie de photos (« Portfolio »)
 * que l'import n'avait pas reprise : 25 articles, près de 1 200 photos (manifs, fêtes de l'Huma, goodies…).
 * Ce script lit les pages brutes (migration/raw), télécharge les photos manquantes depuis l'ancien site
 * dans migration/media, les enregistre dans Médias, puis ajoute la galerie à la fin du texte importé de l'article.
 *
 *   pnpm portfolios                 # tous les articles qui ont un portfolio
 *   pnpm portfolios slug1 slug2     # seulement ceux-là
 *   REBUILD=1 pnpm portfolios       # refait les galeries déjà en place
 *
 * Relançable : photos déjà téléchargées ou déjà dans Médias et galeries déjà en place sont laissées telles quelles.
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const MIG = path.resolve(process.cwd(), process.env.MIGRATION_DIR || '../migration')
const RAW = path.join(MIG, 'raw')
const MEDIA = path.join(MIG, 'media')
const OLD = 'https://www.pcrf-ic.fr/'
const START = '<!-- portfolio:start -->'
const END = '<!-- portfolio:end -->'
// Un contexte neuf à chaque appel : après un envoi de fichier, le plugin de stockage laisse un drapeau dans l'objet reçu,
// et un objet partagé bloque alors en silence tous les envois suivants (fiche créée, fichier absent du stockage).
const ctx = { get context() { return { skipRevalidate: true } } }

type Photo = { rel: string; title: string }

const decode = (s: string) => s.replace(/&#8217;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Photos du bloc « Portfolio » d'une page brute de l'ancien site, dans l'ordre d'affichage. */
function portfolioOf(html: string): Photo[] {
  const block = html.match(/<div class="liste documents documents_portfolio">([\s\S]*?)<\/div>\s*<\/div>/)
  if (!block) return []
  const photos: Photo[] = []
  for (const m of block[1].matchAll(/<a href="(IMG\/[^"]+)"([^>]*)>/g)) {
    const title = m[2].match(/title="([^"]*)"/)?.[1] ?? ''
    photos.push({ rel: decodeURIComponent(m[1]), title: decode(title) })
  }
  return photos
}

async function download(rel: string): Promise<boolean> {
  const abs = path.join(MEDIA, rel)
  if (fs.existsSync(abs)) return true
  const res = await fetch(OLD + rel.split('/').map(encodeURIComponent).join('/'), { headers: { 'User-Agent': 'pcrf-site-migration/1.0' } })
  if (!res.ok) { console.warn(`  téléchargement refusé (${res.status}) : ${rel}`); return false }
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, Buffer.from(await res.arrayBuffer()))
  return true
}

async function main() {
  const payload = await getPayload({ config })
  const wanted = process.argv.slice(2).map((s) => decodeURIComponent(s))
  const files = fs.readdirSync(RAW).filter((f) => f.endsWith('.html')).filter((f) => !wanted.length || wanted.includes(f.slice(0, -5)))

  /** Fiche Média d'une photo de l'ancien site (créée au besoin). */
  async function ensureMedia(rel: string, alt: string) {
    const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: rel } }, limit: 1, depth: 0 })
    if (found.docs[0]) return found.docs[0]
    return payload.create({ collection: 'media', data: { alt, legacyPath: rel }, filePath: path.join(MEDIA, rel), ...ctx })
  }
  /** Adresse relative au site (Payload peut préfixer par l'adresse publique). */
  const relative = (url?: string | null) => (url || '').replace(/^https?:\/\/[^/]+/, '')

  let articles = 0, photos = 0, uploaded = 0
  for (const file of files) {
    const slug = file.slice(0, -5)
    const list = portfolioOf(fs.readFileSync(path.join(RAW, file), 'utf8'))
    if (!list.length) continue
    const a = (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
    if (!a) { console.warn(`article introuvable : ${slug}`); continue }
    const html = a.legacy?.html ?? ''
    if (html.includes(START) && !process.env.REBUILD) { console.log(`${slug} : galerie déjà en place (${list.length} photos)`); continue }
    console.log(`${slug} : ${list.length} photos`)
    const items: string[] = []
    for (const p of list) {
      if (!(await download(p.rel))) continue
      const before = await payload.count({ collection: 'media', where: { legacyPath: { equals: p.rel } } })
      const m = await ensureMedia(p.rel, p.title || a.title)
      if (before.totalDocs === 0) uploaded++
      const full = relative(m.url)
      const thumb = relative(m.sizes?.card?.url) || full
      const w = m.sizes?.card?.width ?? m.width, h = m.sizes?.card?.height ?? m.height
      items.push(`<li><a href="${full}" target="_blank" rel="noopener"><img src="${thumb}" alt="${esc(p.title)}" loading="lazy"${w && h ? ` width="${w}" height="${h}"` : ''}></a></li>`)
      photos++
    }
    if (!items.length) continue
    const gallery = `${START}\n<h2 class="spip">Portfolio</h2>\n<ul class="portfolio">\n${items.join('\n')}\n</ul>\n${END}`
    const base = html.includes(START) ? html.replace(new RegExp(`\\s*${START}[\\s\\S]*?${END}`), '') : html
    await payload.update({ collection: 'articles', id: a.id, data: { legacy: { ...(a.legacy || {}), html: `${base.trimEnd()}\n${gallery}` } }, ...ctx })
    articles++
  }
  console.log(`\n${articles} galeries ajoutées, ${photos} photos (${uploaded} nouvelles dans Médias)`)
  process.exit(0)
}

// `payload run` attend la fin du module : il faut attendre main() ici.
await main().catch((e) => { console.error(e); process.exit(1) })
