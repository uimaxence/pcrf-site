/**
 * Retours du secrétariat (5 novembre) : sous-rubrique « Brochures » dans Matériel,
 * 4 articles à la une, cinq articles de la page Congrès, images défilantes de l'en-tête.
 *
 *   pnpm retours:novembre [image1 image2 ...]
 *
 * Relançable sans doublons.
 */
import path from 'node:path'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const images = process.argv.slice(2)
// Un contexte neuf à chaque appel : après un envoi de fichier, le plugin de stockage laisse un drapeau dans l'objet reçu,
// et un objet partagé bloque alors en silence tous les envois suivants (fiche créée, fichier absent du stockage).
const ctx = { get context() { return { skipRevalidate: true } } }

async function main() {
  const payload = await getPayload({ config })

  const materiel = (await payload.find({ collection: 'rubriques', where: { slug: { equals: 'materiel' } }, limit: 1 })).docs[0]
  if (!materiel) throw new Error('Rubrique Matériel introuvable')
  let brochures = (await payload.find({ collection: 'rubriques', where: { slug: { equals: 'brochures' } }, limit: 1 })).docs[0]
  if (!brochures) {
    brochures = await payload.create({ collection: 'rubriques', data: { name: 'Brochures', slug: 'brochures', parent: materiel.id, order: 30 }, ...ctx })
    console.log('Rubrique Brochures créée')
  }
  // Seuls Programme et les deux livrets restent « à la une » de Matériel ; le reste va dans Brochures.
  const KEEP = ['Programme-du-PCRF', 'Livret-d-accueil-pour-le-futur', 'Livret-simplifie-de-formation']
  const direct = await payload.find({ collection: 'articles', where: { rubrique: { equals: materiel.id } }, limit: 100, depth: 0, draft: false })
  for (const a of direct.docs) {
    if (KEEP.includes(a.slug as string)) continue
    await payload.update({ collection: 'articles', id: a.id, data: { rubrique: brochures.id }, ...ctx })
    console.log(`→ Brochures : ${a.title}`)
  }

  await payload.updateGlobal({ slug: 'accueil', data: { featuredCount: 4 }, ...ctx })

  // Page Congrès : seuls ces cinq articles y figurent (case « Page Congrès »).
  const CONGRES = ['Deuxieme-Congres-du-PCRF-Pour-un', 'Congres-fondateur-du-Parti', 'Textes-adoptes-au-1er-Congres-du', 'Premier-Congres-du-PCRF-premier', 'Les-Partis-freres-saluent-le']
  const flagged = await payload.find({ collection: 'articles', where: { congres: { equals: true } }, limit: 200, depth: 0 })
  for (const a of flagged.docs) {
    if (CONGRES.includes(a.slug as string)) continue
    await payload.update({ collection: 'articles', id: a.id, data: { congres: false }, ...ctx })
  }
  for (const slug of CONGRES) {
    const a = (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
    if (!a) { console.warn(`Congrès : article introuvable (${slug})`); continue }
    if (!a.congres) await payload.update({ collection: 'articles', id: a.id, data: { congres: true }, ...ctx })
    console.log(`→ Congrès : ${a.title}`)
  }

  if (images.length) {
    const ids: number[] = []
    for (const file of images) {
      const abs = path.resolve(file)
      if (!fs.existsSync(abs)) throw new Error(`Fichier introuvable : ${abs}`)
      const legacyPath = `reference/entete/${path.basename(abs)}`
      const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1 })
      const m = found.docs[0] ?? (await payload.create({ collection: 'media', data: { alt: 'Photo militante du PCRF', legacyPath }, filePath: abs, ...ctx }))
      ids.push(m.id as number)
    }
    await payload.updateGlobal({ slug: 'site', data: { mastheadImages: ids.map((image) => ({ image })) }, ...ctx })
    console.log(`En-tête : ${ids.length} images défilantes`)
  }
  process.exit(0)
}

await main()
