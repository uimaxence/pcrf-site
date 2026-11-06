/**
 * Installe le programme dans la fenêtre d'accueil : le PDF et 2 ou 3 images de pages.
 *
 *   pnpm programme <fichier.pdf> <page1.jpg> <page2.jpg> [page3.jpg]
 *
 * Exemple avec les fichiers du dépôt :
 *   pnpm programme ../migration/media/IMG/pdf/programme_pcrf_a4_centre.pdf ../reference/programme/page-01.jpg ../reference/programme/page-03.jpg
 *
 * Les fichiers déjà envoyés (même chemin) sont réutilisés : le script peut être relancé sans doublons.
 */
import path from 'node:path'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const [pdfArg, ...pageArgs] = process.argv.slice(2)
if (!pdfArg || pageArgs.length < 1 || pageArgs.length > 3) {
  console.error('Usage : pnpm programme <fichier.pdf> <page1> <page2> [page3]')
  process.exit(1)
}

// Un contexte neuf à chaque appel : après un envoi de fichier, le plugin de stockage laisse un drapeau dans l'objet reçu,
// et un objet partagé bloque alors en silence tous les envois suivants (fiche créée, fichier absent du stockage).
const ctx = { get context() { return { skipRevalidate: true } } }

async function ensureMedia(payload: Awaited<ReturnType<typeof getPayload>>, file: string, alt: string) {
  const abs = path.resolve(file)
  if (!fs.existsSync(abs)) throw new Error(`Fichier introuvable : ${abs}`)
  const legacyPath = `reference/programme/${path.basename(abs)}`
  const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1 })
  if (found.docs[0]) return found.docs[0]
  return payload.create({ collection: 'media', data: { alt, legacyPath }, filePath: abs, ...ctx })
}

async function main() {
  const payload = await getPayload({ config })
  const pdf = await ensureMedia(payload, pdfArg, 'Programme du PCRF (PDF)')
  const pages = []
  for (const [i, file] of pageArgs.entries()) {
    pages.push(await ensureMedia(payload, file, `Programme du PCRF, page ${i + 1} de l’aperçu`))
  }
  await payload.updateGlobal({
    slug: 'accueil',
    data: { programmePdf: pdf.id, programmePages: pages.map((p) => ({ image: p.id })) },
    ...ctx,
  })
  console.log(`Programme installé : PDF #${pdf.id}, pages ${pages.map((p) => `#${p.id}`).join(', ')}`)
  process.exit(0)
}

await main()
