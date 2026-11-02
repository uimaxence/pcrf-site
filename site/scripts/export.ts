/**
 * Export complet et lisible du contenu : un dossier avec un fichier HTML par article et par page,
 * un index JSON, et une copie des médias. Garantie de réversibilité : tout le contenu part avec ce dossier.
 * Lancer : pnpm export:contenu  (dossier de sortie : ../export, ou EXPORT_DIR)
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import config from '../src/payload.config'

const OUT = path.resolve(process.cwd(), process.env.EXPORT_DIR || '../export')
const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)

function bodyHtml(content: unknown, legacy?: string | null): string {
  const c = content as SerializedEditorState | undefined
  if (c && c.root?.children?.length) return convertLexicalToHTML({ data: c })
  return legacy || ''
}

async function main() {
  const payload = await getPayload({ config })
  fs.mkdirSync(path.join(OUT, 'articles'), { recursive: true })
  fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true })
  const index: Record<string, unknown>[] = []

  const articles = await payload.find({ collection: 'articles', pagination: false, depth: 1, sort: '-date' })
  for (const a of articles.docs) {
    const rub = a.rubrique && typeof a.rubrique === 'object' ? a.rubrique.name : ''
    const cover = a.cover && typeof a.cover === 'object' ? a.cover.url : null
    const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(a.title)}</title></head>
<body>
<article>
<p class="rubrique">${esc(rub)}</p>
<h1>${esc(a.title)}</h1>
<p class="meta">${a.date}${a.auteur ? ` · ${esc(a.auteur)}` : ''}</p>
${a.chapo ? `<p class="chapo"><strong>${esc(a.chapo)}</strong></p>` : ''}
${cover ? `<p class="cover"><img src="${cover}" alt=""></p>` : ''}
${a.videoUrl ? `<p class="video"><a href="${a.videoUrl}">${a.videoUrl}</a></p>` : ''}
${bodyHtml(a.content, a.legacy?.html)}
</article>
</body></html>`
    fs.writeFileSync(path.join(OUT, 'articles', `${a.slug}.html`), html)
    index.push({ type: 'article', slug: a.slug, title: a.title, date: a.date, rubrique: rub, status: a._status, url: `/${a.slug}`, cover })
  }
  const pages = await payload.find({ collection: 'pages', pagination: false, depth: 1 })
  for (const p of pages.docs) {
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(p.title)}</title></head><body><article><h1>${esc(p.title)}</h1>${bodyHtml(p.content, p.legacy?.html)}</article></body></html>`
    fs.writeFileSync(path.join(OUT, 'pages', `${p.slug}.html`), html)
    index.push({ type: 'page', slug: p.slug, title: p.title, url: `/${p.slug}` })
  }
  const rubriques = await payload.find({ collection: 'rubriques', pagination: false, depth: 0 })
  fs.writeFileSync(path.join(OUT, 'rubriques.json'), JSON.stringify(rubriques.docs, null, 2))
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2))

  // Médias téléversés (dossier local) + médias de l'ancien site
  const mediaDir = path.resolve(process.cwd(), 'media')
  if (fs.existsSync(mediaDir)) fs.cpSync(mediaDir, path.join(OUT, 'media'), { recursive: true })
  const legacyDir = path.resolve(process.cwd(), process.env.LEGACY_MEDIA_DIR || '../migration/media')
  if (fs.existsSync(legacyDir)) fs.cpSync(legacyDir, path.join(OUT, 'legacy-media'), { recursive: true })

  fs.writeFileSync(path.join(OUT, 'LISEZMOI.txt'), `Export du site du PCRF — ${new Date().toISOString()}
articles/ : un fichier HTML par article (${articles.totalDocs})
pages/    : pages fixes (${pages.totalDocs})
index.json, rubriques.json : métadonnées
media/ : fichiers téléversés via le site ; legacy-media/ : fichiers de l'ancien site SPIP
Les images dans les HTML pointent vers /api/media/file/... (dossier media/) ou /legacy-media/... (dossier legacy-media/).
`)
  console.log(`export terminé : ${articles.totalDocs} articles, ${pages.totalDocs} pages → ${OUT}`)
  process.exit(0)
}
await main().catch((e) => { console.error(e); process.exit(1) })
