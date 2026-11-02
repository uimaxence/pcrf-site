/**
 * Import du contenu récupéré de l'ancien site SPIP (dossier ../migration/out) dans Payload.
 * Rejouable : les rubriques, médias et articles déjà importés sont ignorés.
 * Lancer : pnpm payload run scripts/import.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { slugify } from '../src/lib/slugify'

const MIG = path.resolve(process.cwd(), process.env.MIGRATION_DIR || '../migration')
const OUT = path.join(MIG, 'out')
const MEDIA = path.join(MIG, 'media')
const OLD = 'https://www.pcrf-ic.fr/'
const readJson = <T,>(f: string, fallback: T): T => {
  try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')) } catch { return fallback }
}
const exists = (rel?: string | null) => Boolean(rel && fs.existsSync(path.join(MEDIA, rel)))
const isImage = (p?: string | null) => /\.(jpe?g|png|gif|webp)$/i.test(p || '')

const NAV_ORDER = ['France', 'International', 'Luttes', 'Journal', 'Campagnes', 'Vidéos', 'Théorie', 'Matériel', 'Informations', 'Don', 'AFFICHES', 'TRACTS']

type Crumb = { slug: string; name: string }
type RawRubrique = { slug: string; url: string; title: string; parents: Crumb[]; description: string | null }
type RawArticle = {
  slug: string; url: string; title: string; date: string | null; authors: { slug: string | null; name: string | null }[]
  rubriques: Crumb[]; logoThumb: string | null; logoOriginalGuess: string | null; logoCandidates?: string[]
  sections: { chapo?: string; texte?: string; ps?: string; notes?: string }
  documents: { href: string | null; type: string | null; thumb: string | null }[]
  iframes: string[]; links: string[]; mediaFiles?: string[]; words: number
}
type Ids = { articles: Record<string, string | null>; rubriques: Record<string, string | null> }

function guessOriginal(src: string): string | null {
  const m = src.split('?')[0].match(/cache-vignettes\/L\d+xH\d+\/(.+?)-[0-9a-f]{5}\.(\w+)$/)
  if (!m) return null
  const [, name, ext] = m
  if (/^arton\d+$/.test(name) || /^siteon\d+$/.test(name)) return `IMG/${name}.${ext}`
  return `IMG/${ext}/${name}.${ext}`
}
/** Signature : nom de l'auteur SPIP, sauf les comptes techniques (« Contact »). */
function authorOf(a: RawArticle): string | null {
  const raw = a.authors[0]?.name || (a.authors[0]?.slug ? a.authors[0].slug.replace(/^_|_$/g, '').replace(/-/g, ' ') : null)
  if (!raw || /^contact$/i.test(raw.trim())) return null
  return raw
}
function stripTags(html?: string) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&#171;|&laquo;/g, '«').replace(/&#187;|&raquo;/g, '»').replace(/&amp;/g, '&').replace(/&#8230;|&hellip;/g, '…').replace(/\s+/g, ' ').trim()
}

async function main() {
  const payload = await getPayload({ config })
  const ctx = { context: { skipRevalidate: true } }
  const rubs = readJson<RawRubrique[]>('rubriques.json', [])
  const ids = readJson<Ids>('ids.json', { articles: {}, rubriques: {} })
  const spipIdBySlug: Record<string, number> = {}
  for (const [id, slug] of Object.entries(ids.articles)) if (slug) spipIdBySlug[slug] = Number(id)
  const rubSpipIdByLegacy: Record<string, number> = {}
  for (const [id, slug] of Object.entries(ids.rubriques)) if (slug) rubSpipIdByLegacy[slug] = Number(id)

  // 1. Rubriques (parents d'abord)
  const rubIdByLegacy: Record<string, number> = {}
  const rubSlugByLegacy: Record<string, string> = {}
  const ordered = [...rubs].sort((a, b) => a.parents.length - b.parents.length)
  for (const r of ordered) {
    const slug = slugify(r.title)
    rubSlugByLegacy[r.slug] = slug
    const found = await payload.find({ collection: 'rubriques', where: { legacySlug: { equals: r.slug } }, limit: 1, depth: 0 })
    if (found.docs[0]) { rubIdByLegacy[r.slug] = found.docs[0].id; continue }
    const parentLegacy = r.parents[r.parents.length - 1]?.slug
    const idx = NAV_ORDER.indexOf(r.title)
    const doc = await payload.create({
      collection: 'rubriques',
      data: {
        name: r.title,
        slug,
        legacySlug: r.slug,
        spipId: rubSpipIdByLegacy[r.slug] ?? null,
        parent: parentLegacy ? (rubIdByLegacy[parentLegacy] ?? null) : null,
        order: (idx >= 0 ? idx : 50) * 10,
        description: r.description ? stripTags(r.description).slice(0, 400) : null,
      },
      ...ctx,
    })
    rubIdByLegacy[r.slug] = doc.id
    console.log('rubrique', r.title, '→', slug)
  }
  const fallbackRub: number = rubIdByLegacy['-Informations-'] ?? Object.values(rubIdByLegacy)[0]

  // 2. Réécriture des adresses dans le HTML importé
  const slugByUrlSlug = new Set<string>()
  const lines = fs.readFileSync(path.join(OUT, 'articles.jsonl'), 'utf8').split('\n').filter(Boolean)
  const articles: RawArticle[] = lines.map((l) => JSON.parse(l))
  for (const a of articles) slugByUrlSlug.add(a.slug)

  function rewriteUrl(raw: string): string {
    let u = raw.trim()
    if (!u || u.startsWith('#') || /^(mailto|tel|javascript):/i.test(u)) return u
    if (/^https?:\/\/(www\.)?pcrf-ic\.fr\//i.test(u)) u = u.replace(/^https?:\/\/(www\.)?pcrf-ic\.fr\//i, '')
    if (/^https?:\/\//i.test(u) || u.startsWith('//')) return u
    const clean = u.split('?')[0].split('#')[0]
    const hash = u.includes('#') ? u.slice(u.indexOf('#')) : ''
    if (clean.startsWith('IMG/')) return exists(clean) ? `/legacy-media/${clean}` : OLD + clean
    if (clean.startsWith('local/cache-vignettes/')) {
      const orig = guessOriginal(clean)
      if (orig && exists(orig)) return `/legacy-media/${orig}`
      if (exists(clean)) return `/legacy-media/${clean}`
      return OLD + u
    }
    if (/^-.+-$/.test(clean)) return rubSlugByLegacy[clean] ? `/rubrique/${rubSlugByLegacy[clean]}` : '/'
    const art = u.match(/^spip\.php\?article(\d+)/)
    if (art) { const s = ids.articles[art[1]]; return s ? `/${s}${hash}` : '/' }
    const rub = u.match(/^spip\.php\?rubrique(\d+)/)
    if (rub) { const s = ids.rubriques[rub[1]]; return s && rubSlugByLegacy[s] ? `/rubrique/${rubSlugByLegacy[s]}` : '/' }
    if (u.startsWith('spip.php')) return '/'
    if (/^_.+_$/.test(clean)) return '#'
    if (clean.startsWith('/')) return u
    if (/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(clean)) return `/${clean}${hash}`
    return OLD + u
  }

  function rewriteHtml(html: string): { html: string; videoUrl: string | null } {
    let videoUrl: string | null = null
    let out = html.replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi, (_m, src: string) => {
      const m = src.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)
      if (m && !videoUrl) { videoUrl = `https://www.youtube.com/watch?v=${m[1]}`; return '' }
      return `<div class="video"><iframe src="${src}" loading="lazy" allowfullscreen></iframe></div>`
    })
    out = out.replace(/<(img|source|video|audio)\b([^>]*?)\ssrc=(["'])([^"']*)\3([^>]*)>/gi, (_m, tag: string, pre: string, _q: string, val: string, post: string) => {
      const nv = rewriteUrl(val)
      const swapped = nv !== val && nv.startsWith('/legacy-media/IMG/') && !val.startsWith('IMG/')
      let attrs = (pre + ' ' + post).replace(/\s+/g, ' ').replace(/\s$/, '')
      if (swapped) attrs = attrs.replace(/\s(width|height)=["']?\d+["']?/gi, '')
      const extra = tag === 'img' ? ' loading="lazy"' : tag === 'video' ? ' controls preload="metadata"' : ''
      return `<${tag}${attrs} src="${nv}"${extra}>`
    })
    out = out.replace(/\shref=(["'])([^"']*)\1/gi, (_m, q: string, val: string) => ` href="${rewriteUrl(val)}"`)
    out = out.replace(/<br class=["']autobr["']\s*\/?>/gi, '<br>')
    return { html: out.trim(), videoUrl }
  }

  // 3. Médias (image principale) puis articles
  const mediaCache = new Map<string, number | null>()
  async function ensureMedia(rel: string, alt: string) {
    if (mediaCache.has(rel)) return mediaCache.get(rel)!
    const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: rel } }, limit: 1, depth: 0 })
    if (found.docs[0]) { mediaCache.set(rel, found.docs[0].id); return found.docs[0].id }
    const abs = path.join(MEDIA, rel)
    if (!fs.existsSync(abs)) { mediaCache.set(rel, null); return null }
    try {
      const doc = await payload.create({ collection: 'media', data: { alt, legacyPath: rel }, filePath: abs, ...ctx })
      mediaCache.set(rel, doc.id)
      return doc.id
    } catch (e) {
      console.warn('média refusé', rel, String(e).slice(0, 120))
      mediaCache.set(rel, null)
      return null
    }
  }

  const errors: { slug: string; error: string }[] = []
  let n = 0, created = 0, skipped = 0
  const existing = await payload.find({ collection: 'articles', pagination: false, depth: 0, select: { slug: true, legacy: true } })
  const have = new Set(existing.docs.map((d) => d.slug))
  for (const a of articles) a.slug = decodeURIComponent(a.slug)
  const limit = Number(process.env.IMPORT_LIMIT || 0)
  const toCreate = process.env.SKIP_ARTICLES ? [] : limit ? articles.slice(0, limit) : articles
  for (const a of toCreate) {
    n++
    if (have.has(a.slug)) { skipped++; continue }
    try {
      const lastRub = a.rubriques[a.rubriques.length - 1]?.slug
      const rubrique = (lastRub && rubIdByLegacy[lastRub]) || fallbackRub
      let coverId: number | null = null
      if (a.logoThumb) {
        const cand = [...(a.logoCandidates || [a.logoOriginalGuess]), a.logoThumb].filter((p): p is string => Boolean(p) && isImage(p) && exists(p))
        if (cand[0]) coverId = await ensureMedia(cand[0], a.title)
      }
      const parts = [a.sections.texte, a.sections.ps, a.sections.notes ? `<div class="notes">${a.sections.notes}</div>` : ''].filter(Boolean)
      const rewritten = rewriteHtml(parts.join('\n'))
      const html = rewritten.html
      const ytLink = a.links.find((l) => /youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/shorts\//.test(l || ''))
      const videoUrl = rewritten.videoUrl || ytLink || null
      const authorName = authorOf(a)
      await payload.create({
        collection: 'articles',
        draft: false,
        data: {
          title: a.title || a.slug,
          slug: decodeURIComponent(a.slug),
          rubrique,
          date: a.date || new Date().toISOString(),
          chapo: a.sections.chapo ? stripTags(a.sections.chapo).slice(0, 600) : null,
          cover: coverId,
          videoUrl,
          auteur: authorName,
          featured: false,
          _status: 'published',
          legacy: { html, spipUrl: a.url, spipId: spipIdBySlug[a.slug] ?? null },
        },
        ...ctx,
      })
      created++
    } catch (e) {
      errors.push({ slug: a.slug, error: String(e).slice(0, 300) })
      console.warn('ERREUR', a.slug, String(e).slice(0, 200))
    }
    if (n % 50 === 0) console.log(`articles ${n}/${toCreate.length} (créés ${created}, déjà présents ${skipped}, erreurs ${errors.length})`)
  }

  // 3b. Option REIMPORT_HTML=1 : recalcule le HTML importé des articles existants (après un nouveau téléchargement de médias).
  if (process.env.REIMPORT_HTML) {
    let updated = 0
    const rawBySlug0 = new Map(articles.map((a) => [a.slug, a]))
    for (const doc of existing.docs) {
      const a = doc.slug ? rawBySlug0.get(doc.slug) : undefined
      if (!a || !doc.legacy?.spipUrl) continue
      const parts = [a.sections.texte, a.sections.ps, a.sections.notes ? `<div class="notes">${a.sections.notes}</div>` : ''].filter(Boolean)
      const rewritten = rewriteHtml(parts.join('\n'))
      const ytLink = a.links.find((l) => /youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/shorts\//.test(l || ''))
      await payload.update({
        collection: 'articles',
        id: doc.id,
        data: { legacy: { ...(doc.legacy || {}), html: rewritten.html }, videoUrl: rewritten.videoUrl || ytLink || null, auteur: authorOf(a) },
        ...ctx,
      })
      updated++
    }
    console.log(`HTML importé recalculé : ${updated}`)
  }
  fs.writeFileSync(path.join(OUT, 'import-errors.json'), JSON.stringify(errors, null, 2))
  console.log(`articles : ${created} créés, ${skipped} déjà présents, ${errors.length} erreurs`)

  // 4. Passe « images principales » : attache le logo aux articles qui n'en ont pas encore, si le fichier est arrivé.
  const rawBySlug = new Map(articles.map((a) => [a.slug, a]))
  const noCover = await payload.find({ collection: 'articles', pagination: false, depth: 0, where: { cover: { exists: false } }, select: { slug: true } })
  let covers = 0
  for (const doc of noCover.docs) {
    const a = rawBySlug.get(doc.slug || '')
    if (!a?.logoThumb) continue
    const cand = [...(a.logoCandidates || [a.logoOriginalGuess]), a.logoThumb].filter((p): p is string => Boolean(p) && isImage(p) && exists(p))
    if (!cand[0]) continue
    const id = await ensureMedia(cand[0], a.title)
    if (!id) continue
    await payload.update({ collection: 'articles', id: doc.id, data: { cover: id }, ...ctx })
    covers++
  }
  console.log(`images principales attachées : ${covers} (${noCover.totalDocs - covers} articles encore sans image)`)

  // 5. Passe « identifiants SPIP » (pour les redirections des anciennes adresses).
  let idsSet = 0
  if (Object.keys(spipIdBySlug).length) {
    const noId = await payload.find({ collection: 'articles', pagination: false, depth: 0, where: { 'legacy.spipId': { exists: false } }, select: { slug: true, legacy: true } })
    for (const doc of noId.docs) {
      const id = doc.slug ? spipIdBySlug[doc.slug] : undefined
      if (!id) continue
      await payload.update({ collection: 'articles', id: doc.id, data: { legacy: { ...(doc.legacy || {}), spipId: id } }, ...ctx })
      idsSet++
    }
    const rubNoId = await payload.find({ collection: 'rubriques', pagination: false, depth: 0, where: { spipId: { exists: false } } })
    for (const r of rubNoId.docs) {
      const id = r.legacySlug ? rubSpipIdByLegacy[r.legacySlug] : undefined
      if (id) await payload.update({ collection: 'rubriques', id: r.id, data: { spipId: id }, ...ctx })
    }
  }
  console.log(`identifiants SPIP renseignés : ${idsSet}`)
  process.exit(0)
}

// `payload run` attend la fin du module : il faut attendre main() ici.
await main().catch((e) => { console.error(e); process.exit(1) })
