/**
 * Retours du 6 novembre : texte de la lettre d'info, « (Italie) » sur la page Liens,
 * page de publicité « Brochures du PCRF » et brochures de Théorie et d'International rangées dans Matériel › Brochures,
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

/** Articles à ranger dans Matériel › Brochures. `from` : rubrique d'origine ; s'ils en sont déjà sortis, on ne touche à rien. */
const BROCHURES = [
  { slug: 'Brochures-du-PCRF', from: 'theorie' }, // la page de publicité des brochures
  { slug: 'Brochure-Conference-sur-les-80-ans', from: 'theorie' },
  { slug: 'Brochure-sur-la-fin-de-l-URSS', from: 'theorie' },
  { slug: 'Brochure-sur-les-succes-du', from: 'theorie' },
  { slug: 'Environnement-brochure-d-analyse', from: 'theorie' },
  { slug: 'Brochure-de-contributions-KKE-PTC', from: 'international' },
  { slug: 'Contre-la-Francafrique-Brochure', from: 'international' },
]

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

  // 3. La page de publicité des brochures et les brochures rangées ailleurs rejoignent Matériel › Brochures.
  const rubrique = async (slug: string) => (await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const brochures = await rubrique('brochures')
  if (!brochures) console.warn('Brochures : rubrique introuvable')
  for (const b of brochures ? BROCHURES : []) {
    const [a, from] = await Promise.all([bySlug(b.slug), rubrique(b.from)])
    if (!a) { console.warn(`Brochures : article introuvable (${b.slug})`); continue }
    if (!from || a.rubrique !== from.id) { console.log(`Brochures : ${a.title} laissé tel quel`); continue }
    await payload.update({ collection: 'articles', id: a.id, data: { rubrique: brochures.id }, ...ctx })
    console.log(`→ Brochures : ${a.title}`)
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
