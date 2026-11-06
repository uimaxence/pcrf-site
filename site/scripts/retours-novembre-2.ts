/**
 * Retours du 6 novembre : texte de la lettre d'info, « (Italie) » sur la page Liens,
 * page de publicité « Brochures du PCRF » rangée dans Matériel › Brochures,
 * visuels en hauteur pour deux affiches et le livret d'accueil.
 *
 *   pnpm retours:novembre2
 *
 * Relançable sans doublons. Ne touche pas à un texte, un rangement ou un visuel modifié entre-temps dans l'admin.
 */
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const VISUELS = path.resolve(dirname, '../../reference/visuels-materiel')
// Un contexte neuf à chaque appel : après un envoi de fichier, le plugin de stockage laisse un drapeau dans l'objet reçu,
// et un objet partagé bloque alors en silence tous les envois suivants (fiche créée, fichier absent du stockage).
const ctx = { get context() { return { skipRevalidate: true } } }

const OLD_NEWSLETTER = 'Une à deux fois par semaine, nos articles et appels dans votre boîte mail. Désinscription en un clic.'
const NEW_NEWSLETTER = 'Deux fois par mois, nos articles et appels dans votre boîte mail. Désinscription en un clic.'

/** Article → nouveau visuel en hauteur. `from` : nom du visuel d'origine ; s'il a déjà été changé, on ne touche à rien. */
const COVERS = [
  { slug: 'Livret-d-accueil-pour-le-futur', from: 'arton42.png', file: 'livret-accueil-page-1.jpg', alt: 'Première page du livret d’accueil : Connaître et rejoindre le PCRF' },
  { slug: 'AFFICHES-contre-l-UE', from: 'arton629.jpg', file: 'affiche-contre-ue.jpg', alt: 'Affiche : Contre l’UE et le capital, pour le socialisme-communisme' },
  { slug: 'AFFICHE-Centenaire-Octobre-17', from: 'arton119.jpg', file: 'affiche-100-ans-urss.jpg', alt: 'Affiche : 1922-2022, 100 ans de l’URSS' },
]

async function main() {
  const payload = await getPayload({ config })
  const bySlug = async (slug: string, depth = 0) =>
    (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth })).docs[0]

  // 1. Lettre d'information : bimensuelle.
  const site = await payload.findGlobal({ slug: 'site', depth: 0 })
  if (site.newsletterText === OLD_NEWSLETTER) {
    await payload.updateGlobal({ slug: 'site', data: { newsletterText: NEW_NEWSLETTER }, ...ctx })
    console.log('Lettre d’info : texte passé à « Deux fois par mois »')
  } else {
    console.log(`Lettre d’info : texte laissé tel quel (« ${site.newsletterText} »)`)
  }

  // 2. Page Liens : préciser le pays du Fronte Comunista.
  const liens = await bySlug('Liens')
  const html = liens?.legacy?.html ?? ''
  if (liens && /Fronte comunista(?! \(Italie\))/i.test(html)) {
    await payload.update({ collection: 'articles', id: liens.id, data: { legacy: { ...liens.legacy, html: html.replace(/Fronte comunista(?! \(Italie\))/i, 'Fronte Comunista (Italie)') } }, ...ctx })
    console.log('Liens : « Fronte Comunista (Italie) »')
  } else {
    console.log(liens ? 'Liens : déjà à jour' : 'Liens : article introuvable')
  }

  // 3. La page de publicité des brochures quitte Théorie pour Matériel › Brochures.
  const rubrique = async (slug: string) => (await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const [brochures, theorie] = await Promise.all([rubrique('brochures'), rubrique('theorie')])
  const pub = await bySlug('Brochures-du-PCRF')
  if (!brochures || !pub) {
    console.warn('Brochures : rubrique ou article introuvable')
  } else if (theorie && pub.rubrique === theorie.id) {
    await payload.update({ collection: 'articles', id: pub.id, data: { rubrique: brochures.id }, ...ctx })
    console.log(`→ Brochures : ${pub.title}`)
  } else {
    console.log('Brochures : « Brochures du PCRF » déjà rangé')
  }

  // 4. Visuels en hauteur.
  for (const c of COVERS) {
    const a = await bySlug(c.slug, 1)
    if (!a) { console.warn(`Visuel : article introuvable (${c.slug})`); continue }
    const current = a.cover && typeof a.cover === 'object' ? a.cover.filename : null
    if (current !== c.from) { console.log(`Visuel : ${a.title} laissé tel quel (${current ?? 'aucun'})`); continue }
    const abs = path.join(VISUELS, c.file)
    if (!fs.existsSync(abs)) throw new Error(`Fichier introuvable : ${abs}`)
    const legacyPath = `reference/visuels-materiel/${c.file}`
    const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1 })
    let media = found.docs[0]
    if (!media) media = await payload.create({ collection: 'media', data: { alt: c.alt, legacyPath }, filePath: abs, ...ctx })
    await payload.update({ collection: 'articles', id: a.id, data: { cover: media.id, coverPosition: 'center', coverFit: 'cover' }, ...ctx })
    console.log(`Visuel : ${a.title} → ${media.filename}`)
  }
  process.exit(0)
}

await main()
