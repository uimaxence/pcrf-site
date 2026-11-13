/**
 * Retours du 10 novembre : rubrique Matériel › Goodies (avec l'article des t-shirts, écussons et posters),
 * adresse du site de chaque campagne (le logo y renvoie), page et entrée de menu « Nous rejoindre ».
 *
 *   pnpm retours:novembre3
 *
 * Relançable sans doublons. Ne touche pas à une adresse, un rangement ou un visuel modifié entre-temps dans l'admin.
 * Lancer `pnpm portfolios A-ne-pas-manquer-nos-enveloppes-396` avant, pour que la photo de couverture des goodies existe.
 */
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Un contexte neuf à chaque appel (voir scripts/seed.ts).
const ctx = { get context() { return { skipRevalidate: true } } }

const GOODIES_SLUG = 'A-ne-pas-manquer-nos-enveloppes-396'
/** Quatrième et dernière ligne de Matériel (Brochures 30, Affiches et Tracts 100). */
const GOODIES_ORDER = 110
/** Bandeau de l'accueil agrandi (photo de 1920, 1170 px → 3520 px) : remplace l'ancien fichier trop petit. */
const BANNER_FILE = path.resolve(dirname, '../../reference/ancien-site/bandeau-lenine.jpg')
const BANNER_LEGACY = 'reference/bandeau-lenine-hd.jpg'
/** Photo de l'ancien portfolio qui sert de visuel à l'article des goodies (à la place du petit logo de 200 px). */
const GOODIES_COVER = 'IMG/jpg/ecussons_et_enveloppes_sovietiques_2-4cf02.jpg'

/** Article de campagne → site de la campagne (d'après les liens contenus dans chaque article). */
const CAMPAGNES: Record<string, string> = {
  'Site-de-la-campagne-Paix': 'https://campagnepourlapaix.wordpress.com',
  'Lancement-de-la-campagne-PAIX': 'https://campagnepourlapaix.wordpress.com',
  'Site-de-la-campagne-Sante': 'https://campagnepourlasante.wordpress.com',
  'Site-de-la-campagne-Pour-nos': 'https://nosemplois.wordpress.com',
  'Site-de-la-campagne-Environnement': 'https://pourlenvironnement.wordpress.com',
  'Site-de-la-campagne-Libertes': 'https://pournoslibertes.wordpress.com',
  'Site-de-la-campagne-Contre-la-vie': 'https://viechere.wordpress.com',
  'Site-de-la-campagne-Femmes': 'https://campagnefemmesetlgbtplus.wordpress.com',
}

export const JOIN_INTRO = `<p>Tu partages nos analyses et tu veux agir avec nous ? Remplis ce formulaire : un camarade te recontacte rapidement pour échanger et te proposer de rencontrer les militants près de chez toi.</p>
<p>Adhérer au PCRF, c’est rejoindre un parti de militants organisés, présents dans les luttes, qui se forment et agissent ensemble pour le socialisme-communisme.</p>`

async function main() {
  const payload = await getPayload({ config })
  const bySlug = async (slug: string) => (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const rubrique = async (slug: string) => (await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]

  // 1. Matériel › Goodies, avec l'article du 12 décembre 2019.
  const materiel = await rubrique('materiel')
  if (!materiel) throw new Error('Rubrique Matériel introuvable')
  let goodies = await rubrique('goodies')
  if (!goodies) {
    goodies = await payload.create({ collection: 'rubriques', data: { name: 'Goodies', slug: 'goodies', parent: materiel.id, order: GOODIES_ORDER, description: 'T-shirts, écussons, posters, enveloppes et pochettes à commander.' }, ...ctx })
    console.log('Rubrique Goodies créée')
  } else if (goodies.order !== GOODIES_ORDER) {
    await payload.update({ collection: 'rubriques', id: goodies.id, data: { order: GOODIES_ORDER }, ...ctx })
    console.log('Rubrique Goodies : placée en dernier')
  }
  const art = await bySlug(GOODIES_SLUG)
  if (!art) {
    console.warn(`Goodies : article introuvable (${GOODIES_SLUG})`)
  } else {
    const data: Record<string, unknown> = {}
    if (art.rubrique !== goodies.id) data.rubrique = goodies.id
    const current = art.cover ? (await payload.findByID({ collection: 'media', id: art.cover as number, depth: 0 })).legacyPath : null
    const photo = (await payload.find({ collection: 'media', where: { legacyPath: { equals: GOODIES_COVER } }, limit: 1, depth: 0 })).docs[0]
    if (photo && (!art.cover || current === 'IMG/logo/arton396.png')) { data.cover = photo.id; data.coverFit = 'cover'; data.coverPosition = 'center' }
    if (!photo) console.warn('Goodies : photo de couverture absente de Médias (lancer pnpm portfolios d’abord)')
    if (Object.keys(data).length) {
      await payload.update({ collection: 'articles', id: art.id, data, ...ctx })
      console.log(`→ Goodies : ${art.title}${data.cover ? ' (nouveau visuel)' : ''}`)
    } else console.log('Goodies : déjà en place')
  }

  // 2. Site de chaque campagne.
  for (const [slug, url] of Object.entries(CAMPAGNES)) {
    const a = await bySlug(slug)
    if (!a) { console.warn(`Campagne : article introuvable (${slug})`); continue }
    if (a.externalUrl) { console.log(`Campagne : ${a.title} → ${a.externalUrl} (laissé)`); continue }
    await payload.update({ collection: 'articles', id: a.id, data: { externalUrl: url }, ...ctx })
    console.log(`→ Campagne : ${a.title} → ${url}`)
  }

  // 3. Page « Nous rejoindre » et son entrée dans le menu noir (avant « Contact »).
  let page = (await payload.find({ collection: 'pages', where: { slug: { equals: 'nous-rejoindre' } }, limit: 1, depth: 0 })).docs[0]
  if (!page) {
    page = await payload.create({ collection: 'pages', data: { title: 'Nous rejoindre', slug: 'nous-rejoindre', _status: 'published', legacy: { html: JOIN_INTRO } }, ...ctx })
    console.log('Page « Nous rejoindre » créée')
  }
  const nav = await payload.findGlobal({ slug: 'navigation', depth: 0 })
  const secondary = (nav.secondary ?? []).map((l) => ({ ...l }))
  if (!secondary.some((l) => /rejoindre/i.test(l.label))) {
    const entry = { label: 'Nous rejoindre', type: 'page' as const, page: page.id, newTab: false }
    const at = secondary.findIndex((l) => /^contact$/i.test(l.label))
    secondary.splice(at === -1 ? secondary.length : at, 0, entry)
    await payload.updateGlobal({ slug: 'navigation', data: { secondary }, ...ctx })
    console.log('Menu : « Nous rejoindre » ajouté')
  } else console.log('Menu : « Nous rejoindre » déjà présent')

  // 4. Bandeau de l'accueil en haute définition.
  const site = await payload.findGlobal({ slug: 'site', depth: 1 })
  const current = site.bannerImage && typeof site.bannerImage === 'object' ? site.bannerImage : null
  if ((current?.width ?? 0) >= 2000) {
    console.log(`Bandeau : déjà en haute définition (${current?.width} px)`)
  } else if (!fs.existsSync(BANNER_FILE)) {
    console.warn(`Bandeau : fichier introuvable (${BANNER_FILE})`)
  } else {
    const found = (await payload.find({ collection: 'media', where: { legacyPath: { equals: BANNER_LEGACY } }, limit: 1, depth: 0 })).docs[0]
    const hd = found ?? (await payload.create({ collection: 'media', data: { alt: 'Lénine s’adressant à la foule', legacyPath: BANNER_LEGACY }, filePath: BANNER_FILE, ...ctx }))
    await payload.updateGlobal({ slug: 'site', data: { bannerImage: hd.id }, ...ctx })
    console.log(`Bandeau : nouveau fichier ${hd.width}×${hd.height}`)
  }

  process.exit(0)
}

await main().catch((e) => { console.error(e); process.exit(1) })
