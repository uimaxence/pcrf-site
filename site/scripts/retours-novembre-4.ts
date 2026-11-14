/**
 * Retours du 14 novembre (Fab et eowyn) :
 *
 *  1. Fin de la rubrique « Informations » (fourre-tout hérité de SPIP) : Qui sommes-nous, Liens, Mentions légales et les deux
 *     pages techniques de la lettre d'information deviennent des pages (mêmes adresses, plus de bloc « Dans la rubrique ») ;
 *     les textes de Congrès et le Comité central de 2018 rejoignent France ; la rubrique vide est supprimée.
 *  2. Liens : les partis de l'Action communiste européenne, du plus grand au plus petit, avec leur pays.
 *  3. Menus : « Nous rejoindre » quitte la deuxième ligne et rejoint le pied de page sous Contact ; colonne ACE du pied de
 *     page sur deux colonnes, complétée par CPN (Pays-Bas), PdA (Autriche), SKP (Suède) et WPI (Irlande).
 *  4. Goodies : un article par produit (t-shirts, posters, enveloppes, écussons, pochettes) ; l'article général est masqué.
 *
 *   pnpm retours:novembre4
 *
 * Relançable sans doublons. À lancer après le déploiement (migration « deux colonnes » et identifiant SPIP des pages).
 */
import { getPayload } from 'payload'
import type { Article, Media, Navigation } from '../src/payload-types'
import config from '../src/payload.config'

// Un contexte neuf à chaque appel (voir scripts/seed.ts).
const ctx = { get context() { return { skipRevalidate: true } } }

type NavLink = NonNullable<Navigation['secondary']>[number]

/** Partis membres de l'ACE (https://www.eurcomact.org/parties/), du plus grand au plus petit, hors PCRF. */
const ACE = [
  { sigle: 'KKE', nom: 'Parti communiste de Grèce', pays: 'Grèce', url: 'https://inter.kke.gr/fr/' },
  { sigle: 'TKP', nom: 'Parti communiste de Turquie', pays: 'Turquie', url: 'https://www.tkp.org.tr/' },
  { sigle: 'PCTE', nom: 'Parti communiste des travailleurs d’Espagne', pays: 'Espagne', url: 'https://www.pcte.es/' },
  { sigle: 'Fronte Comunista', nom: 'Front communiste', pays: 'Italie', url: 'https://www.frontecomunista.it/' },
  { sigle: 'CPN', nom: 'Parti communiste des Pays-Bas', pays: 'Pays-Bas', url: 'https://cpn.nl/' },
  { sigle: 'PdA', nom: 'Parti du travail d’Autriche', pays: 'Autriche', url: 'https://parteiderarbeit.at/' },
  { sigle: 'SKP', nom: 'Parti communiste de Suède', pays: 'Suède', url: 'https://skp.se/' },
  { sigle: 'WPI', nom: 'Parti des travailleurs d’Irlande', pays: 'Irlande', url: 'https://workersparty.net/' },
  { sigle: 'KTP', nom: 'Parti communiste ouvrier – Pour la paix et le socialisme', pays: 'Finlande', url: 'https://www.ktpkom.fi/' },
  { sigle: 'KP', nom: 'Parti communiste', pays: 'Suisse', url: 'https://kommunisten.ch/' },
  { sigle: '', nom: 'Union des communistes d’Ukraine', pays: 'Ukraine', url: 'https://ucukraine.wordpress.com/' },
]
/** Les quatre partis à ajouter dans la colonne ACE du pied de page (seconde colonne, sous CPN… dans l'ordre demandé). */
const ACE_FOOTER_EXTRA = ['CPN', 'PdA', 'SKP', 'WPI']

const LIENS_HTML = `<p><strong>Notre chaîne TV Rouge IC sur YouTube :</strong><br>
<a href="https://www.youtube.com/channel/UCoyBtYYDy0MuqfR_P_-CVYQ" class="spip_out" rel="external">youtube.com/channel/UCoyBtYYDy0MuqfR_P_-CVYQ</a></p>
<p>Liens vers les sites d’organisations communistes et de lutte de classe :</p>
<p><strong>Union de la Jeunesse Communiste (UJC)</strong><br>
<a href="http://www.unionjc.fr/" class="spip_out" rel="external">www.unionjc.fr</a></p>
<h2 class="spip">Action communiste européenne (ACE)</h2>
<p><a href="https://www.eurcomact.org/" class="spip_out" rel="external">www.eurcomact.org</a></p>
<p>Les partis membres de l’ACE, du plus grand au plus petit :</p>
<ul class="spip" role="list">
${ACE.map((p) => `<li><strong>${p.sigle ? `${p.sigle} – ` : ''}${p.nom} (${p.pays})</strong><br>
<a href="${p.url}" class="spip_out" rel="external">${p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></li>`).join('\n')}
</ul>
<p><strong>Initiative européenne des Partis communistes et ouvriers</strong><br>
<a href="https://www.initiative-cwpe.org/en/home" class="spip_out" rel="external">www.initiative-cwpe.org</a></p>`

const MENTIONS_HTML = `<h2 class="spip">Éditeur</h2>
<p><strong>Parti Communiste Révolutionnaire de France</strong><br>
Adresse postale : Les Amis d’Oulianov – B.P. 40084 – 75862 PARIS CEDEX 18<br>
Contact : <a href="/contact" class="spip_in">nous écrire</a></p>
<p><strong>Directrice de publication</strong> : Emmanuelle KRAEMER</p>
<p><strong>Rédaction, animation et gestion éditoriale</strong> : équipe web du PCRF</p>
<h2 class="spip">Hébergement</h2>
<p>Vercel Inc.<br>
440 N Barranca Avenue #4133<br>
Covina, CA 91723, États-Unis<br>
<a href="https://vercel.com/" class="spip_out" rel="external">vercel.com</a></p>
<p>Ce site n’utilise pas de cookies de suivi.</p>`

/** Articles de la rubrique « Informations » qui deviennent des pages (même adresse). */
const EN_PAGES: { slug: string; html?: string }[] = [
  { slug: 'Qui-sommes-nous' },
  { slug: 'Liens', html: LIENS_HTML },
  { slug: 'Vous-etes-inscrit' },
  { slug: 'Confirmation-de-votre-inscription' },
]
/** L'article « Mentions légales » disparaît au profit de la page existante, mise à jour. */
const MENTIONS_ARTICLE = 'Mentions-legales'
/** Textes de Congrès et Comité central : rejoignent France, comme le 2ème Congrès. */
const VERS_FRANCE = ['Comite-Central-du-4-fevrier-2018', 'Premier-Congres-du-PCRF-premier', 'Textes-adoptes-au-1er-Congres-du', 'Congres-fondateur-du-Parti']

const COMMANDE = `<h2 class="spip">Pour commander</h2>
<p>Envoyez votre chèque, à l’ordre du PCRF, à « Les Amis d’Oulianov » – BP 40084 – 75862 PARIS CEDEX 18, en précisant l’article et la quantité souhaités.</p>
<p>Paiement par virement possible sur demande (page <a href="/contact" class="spip_in">Contact</a>). Prix dégressifs en cas de grosse commande : merci de le préciser dans votre message. Frais de port en sus.</p>`

const GOODIES_OVERVIEW = 'A-ne-pas-manquer-nos-enveloppes-396'
/** Un article par goodie, dans l'ordre d'affichage (le premier a la date la plus récente). Photos : fichiers déjà dans Médias. */
const GOODIES: { slug: string; title: string; chapo: string; html: string; photos: string[]; coverFit?: 'cover' | 'contain' }[] = [
  {
    slug: 'goodies-t-shirts',
    title: 'T-shirts Marx et Staline',
    chapo: 'Deux t-shirts exclusifs, rouge ou vert bouteille, coupe homme ou femme, du S au XXL. 15 € hors frais postaux.',
    html: `<p>T-shirt exclusif Marx « Prolétaires de tous les pays, unissez-vous ! » et t-shirt exclusif Staline « Les chefs vont et viennent, mais les peuples restent », chacun en deux couleurs au choix, rouge ou vert bouteille, à <strong>15 €</strong> hors frais postaux.</p>
<p>Coupe homme ou femme, tailles disponibles : S, M, L, XL, XXL. Préciser le modèle, la couleur, la coupe et la taille dans votre commande.</p>`,
    photos: ['marx_tshirt_recto-3.jpg', 'marx_tshirt_verso-3.jpg', 'staline_tshirt_recto-3.jpg', 'staline_tshirt_verso-3.jpg'],
  },
  {
    slug: 'goodies-posters',
    title: 'Posters A4 recto-verso',
    chapo: 'Deux posters A4 exclusifs recto-verso : « Lénine et Staline travaillant ensemble » / « Discours de Lénine » et « Staline contre Hitler » / « Discours de Lénine devant le soviet de Petrograd ». 3 € pièce.',
    html: `<p>Posters A4 exclusifs recto-verso, à <strong>3 €</strong> pièce :</p>
<ul class="spip" role="list"><li>« Lénine et Staline travaillant ensemble » / « Discours de Lénine » ;</li>
<li>« Staline contre Hitler » / « Discours de Lénine devant le soviet de Petrograd ».</li></ul>`,
    photos: ['lenine_et_staline_travaillant_ensemble-3.jpg', 'discours_de_lenine_devant_assemblee-3.jpg', 'staline_vs_hitler-3.jpg'],
  },
  {
    slug: 'goodies-enveloppes',
    title: 'Enveloppes « Révolution d’Octobre »',
    chapo: 'Enveloppes spéciales « Révolution d’Octobre », 5 € les 10.',
    html: `<p>Enveloppes spéciales « Révolution d’Octobre », à <strong>5 €</strong> les 10 enveloppes.</p>`,
    photos: ['ecussons_et_enveloppes_sovietiques_2-4cf02-1.jpg'],
  },
  {
    slug: 'goodies-ecussons-patchs',
    title: 'Écussons et patchs',
    chapo: 'Écussons et patchs aux drapeaux de l’Union soviétique, de Cuba, du Viêt Nam et de la RPD de Corée. 2 € pièce.',
    html: `<p>Écussons et patchs à l’effigie des drapeaux de l’Union soviétique, de Cuba, du Viêt Nam et de la République populaire démocratique de Corée, à <strong>2 €</strong> pièce.</p>`,
    photos: ['ecussons_et_enveloppes_sovietiques_2-4cf02-1.jpg'],
  },
  {
    slug: 'goodies-pochettes',
    title: 'Pochettes',
    chapo: 'Pochette exclusive recto-verso « Discours de Lénine devant le soviet de Petrograd » / « Staline contre Hitler » et pochette des 80 ans de la victoire sur le fascisme. 3 € pièce.',
    html: `<p>Pochettes à <strong>3 €</strong> pièce :</p>
<ul class="spip" role="list"><li>pochette exclusive recto-verso « Discours de Lénine devant le soviet de Petrograd » / « Staline contre Hitler » ;</li>
<li>pochette des 80 ans de la victoire sur le fascisme, « L’URSS et la Résistance ont sauvé l’humanité ».</li></ul>`,
    photos: ['arton365-08f45-1.jpg', 'staline-vs-hitler-pcrf-1.jpg', 'pochette_congres_juin2025_page-2.jpg'],
    coverFit: 'contain',
  },
]
/** Date de l'article d'origine ; chaque goodie prend une heure de moins que le précédent pour garder l'ordre ci-dessus. */
const GOODIES_DATE = Date.parse('2019-12-12T18:00:00+01:00')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const relative = (url?: string | null) => (url || '').replace(/^https?:\/\/[^/]+/, '')

function gallery(photos: Media[]): string {
  const items = photos.map((m) => {
    const full = relative(m.url)
    const thumb = relative(m.sizes?.card?.url) || full
    const w = m.sizes?.card?.width ?? m.width, h = m.sizes?.card?.height ?? m.height
    return `<li><a href="${full}" target="_blank" rel="noopener"><img src="${thumb}" alt="${esc(m.alt || '')}" loading="lazy"${w && h ? ` width="${w}" height="${h}"` : ''}></a></li>`
  })
  return `<!-- portfolio:start -->\n<h2 class="spip">Photos</h2>\n<ul class="portfolio">\n${items.join('\n')}\n</ul>\n<!-- portfolio:end -->`
}

async function main() {
  const payload = await getPayload({ config })
  const article = async (slug: string) => (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const pageBySlug = async (slug: string) => (await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const rubrique = async (slug: string) => (await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  const media = async (filename: string) => (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })).docs[0]

  const nav = await payload.findGlobal({ slug: 'navigation', depth: 0 })
  let secondary: NavLink[] = (nav.secondary ?? []).map((l) => ({ ...l }))
  const footerColumns = (nav.footerColumns ?? []).map((c) => ({ ...c, links: (c.links ?? []).map((l) => ({ ...l })) }))
  const allLinks = () => [...(nav.primary ?? []), ...secondary, ...footerColumns.flatMap((c) => c.links)]
  /** Les liens de menu qui visaient l'article visent désormais la page. */
  const repoint = (articleId: number, pageId: number) => {
    for (const l of allLinks()) {
      const target = typeof l.article === 'object' && l.article ? l.article.id : l.article
      if (l.type === 'article' && target === articleId) { l.type = 'page'; l.page = pageId; l.article = null }
    }
  }

  // 1. Les articles de « Informations » qui deviennent des pages.
  for (const { slug, html } of EN_PAGES) {
    const a = await article(slug)
    if (!a) { console.log(`Page ${slug} : déjà en place`); continue }
    const existing = await pageBySlug(slug)
    const page = existing ?? (await payload.create({
      collection: 'pages',
      data: {
        title: a.title,
        slug,
        _status: 'published',
        cover: typeof a.cover === 'object' && a.cover ? a.cover.id : (a.cover ?? null),
        legacy: { html: html ?? a.legacy?.html ?? '', spipUrl: a.legacy?.spipUrl ?? null, spipId: a.legacy?.spipId ?? null },
      },
      ...ctx,
    }))
    repoint(a.id, page.id)
    await payload.delete({ collection: 'articles', id: a.id, ...ctx })
    console.log(`→ Page ${slug} : ${existing ? 'existait déjà' : 'créée'}, article supprimé`)
  }
  // Mentions légales : la page existante reprend le contenu de l'article (hébergeur mis à jour).
  const mentionsPage = await pageBySlug('mentions-legales')
  const mentionsArt = await article(MENTIONS_ARTICLE)
  if (mentionsPage) {
    if (!mentionsPage.legacy?.html?.includes('Vercel') || mentionsArt) {
      await payload.update({
        collection: 'pages',
        id: mentionsPage.id,
        data: { legacy: { html: MENTIONS_HTML, spipUrl: mentionsArt?.legacy?.spipUrl ?? mentionsPage.legacy?.spipUrl ?? null, spipId: mentionsArt?.legacy?.spipId ?? mentionsPage.legacy?.spipId ?? null } },
        ...ctx,
      })
      console.log('→ Page mentions-legales : contenu repris de l’ancien site')
    } else console.log('Page mentions-legales : déjà à jour')
    if (mentionsArt) {
      repoint(mentionsArt.id, mentionsPage.id)
      await payload.delete({ collection: 'articles', id: mentionsArt.id, ...ctx })
      console.log('→ Article Mentions-legales supprimé')
    }
  } else console.warn('Page mentions-legales introuvable (seed non lancé ?)')

  // Les textes de Congrès et le Comité central rejoignent France, puis la rubrique vide est supprimée.
  const france = await rubrique('france')
  const infos = await rubrique('informations')
  if (!france) throw new Error('Rubrique France introuvable')
  for (const slug of VERS_FRANCE) {
    const a = await article(slug)
    if (!a) { console.warn(`Article introuvable : ${slug}`); continue }
    const current = typeof a.rubrique === 'object' && a.rubrique ? a.rubrique.id : a.rubrique
    if (!infos || current !== infos.id) { console.log(`${a.title} : rangé ailleurs, laissé`); continue }
    await payload.update({ collection: 'articles', id: a.id, data: { rubrique: france.id }, ...ctx })
    console.log(`→ France : ${a.title}`)
  }
  if (infos) {
    const left = await payload.find({ collection: 'articles', where: { rubrique: { equals: infos.id } }, limit: 10, depth: 0 })
    const children = await payload.count({ collection: 'rubriques', where: { parent: { equals: infos.id } } })
    if (left.totalDocs === 0 && children.totalDocs === 0) {
      for (const l of allLinks()) if (l.type === 'rubrique' && (typeof l.rubrique === 'object' && l.rubrique ? l.rubrique.id : l.rubrique) === infos.id) console.warn('Un lien de menu visait « Informations » : à corriger dans l’admin')
      await payload.delete({ collection: 'rubriques', id: infos.id, ...ctx })
      console.log('→ Rubrique « Informations » supprimée')
    } else console.warn(`Rubrique « Informations » conservée : ${left.totalDocs} article(s) encore dedans (${left.docs.map((d) => d.title).join(', ')})`)
  } else console.log('Rubrique « Informations » : déjà supprimée')

  // 3. Menus : « Nous rejoindre » quitte la deuxième ligne, rejoint le pied de page sous Contact ; colonne ACE complétée.
  const before = secondary.length
  secondary = secondary.filter((l) => !/rejoindre/i.test(l.label))
  if (secondary.length !== before) console.log('→ Menu noir : « Nous rejoindre » retiré')
  const joinPage = await pageBySlug('nous-rejoindre')
  const parti = footerColumns.find((c) => /parti/i.test(c.title)) ?? footerColumns[0]
  if (joinPage && parti && !parti.links.some((l) => /rejoindre/i.test(l.label))) {
    const at = parti.links.findIndex((l) => /^contact$/i.test(l.label))
    parti.links.splice(at === -1 ? parti.links.length : at + 1, 0, { label: 'Nous rejoindre', type: 'page', page: joinPage.id, newTab: false })
    console.log(`→ Pied de page « ${parti.title} » : « Nous rejoindre » ajouté sous Contact`)
  }
  const ace = footerColumns.find((c) => /action communiste/i.test(c.title))
  if (ace) {
    ace.twoColumns = true
    for (const sigle of ACE_FOOTER_EXTRA) {
      const p = ACE.find((x) => x.sigle === sigle)!
      if (ace.links.some((l) => (l.url || '').includes(new URL(p.url).hostname) || new RegExp(`^${sigle}\\b`).test(l.label))) continue
      ace.links.push({ label: `${p.sigle} (${p.pays})`, type: 'url', url: p.url, newTab: true })
      console.log(`→ Pied de page ACE : ${p.sigle} (${p.pays}) ajouté`)
    }
  } else console.warn('Colonne « Action communiste européenne » introuvable dans le pied de page')
  await payload.updateGlobal({ slug: 'navigation', data: { primary: nav.primary ?? [], secondary, footerColumns }, ...ctx })
  console.log('Menus enregistrés')

  // 4. Goodies : un article par produit ; l'article général est masqué (son contenu est repris dans les cinq articles).
  const goodies = await rubrique('goodies')
  if (!goodies) throw new Error('Rubrique Goodies introuvable (lancer pnpm retours:novembre3 d’abord)')
  for (const [i, g] of GOODIES.entries()) {
    if (await article(g.slug)) { console.log(`Goodie ${g.title} : déjà créé`); continue }
    const photos: Media[] = []
    for (const f of g.photos) {
      const m = await media(f)
      if (m) photos.push(m)
      else console.warn(`Goodie ${g.title} : photo absente de Médias (${f})`)
    }
    const data: Partial<Article> = {
      title: g.title,
      slug: g.slug,
      chapo: g.chapo,
      rubrique: goodies.id,
      date: new Date(GOODIES_DATE - i * 3600_000).toISOString(),
      cover: photos[0]?.id ?? null,
      coverFit: g.coverFit ?? 'cover',
      coverPosition: 'center',
      visible: true,
      _status: 'published',
      legacy: { html: `${g.html}\n${COMMANDE}${photos.length ? `\n${gallery(photos)}` : ''}` },
    }
    await payload.create({ collection: 'articles', data: data as Article, ...ctx })
    console.log(`→ Goodie créé : ${g.title} (${photos.length} photo(s))`)
  }
  const overview = await article(GOODIES_OVERVIEW)
  if (overview && overview.visible !== false) {
    await payload.update({ collection: 'articles', id: overview.id, data: { visible: false }, ...ctx })
    console.log(`→ Article général des goodies masqué : ${overview.title}`)
  }

  process.exit(0)
}

await main().catch((e) => { console.error(e); process.exit(1) })
