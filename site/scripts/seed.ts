/**
 * Amorçage : compte administrateur, logo et bandeau, menus, pages fixes, réglages de l'accueil.
 * Rejouable. Lancer : pnpm payload run scripts/seed.ts
 * Variables : ADMIN_EMAIL, ADMIN_PASSWORD (sinon un mot de passe est généré et affiché).
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const REF = path.resolve(process.cwd(), '../reference/ancien-site')

async function main() {
  const payload = await getPayload({ config })
  const ctx = { context: { skipRevalidate: true } }

  // Administrateur
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (users.totalDocs === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@pcrf-ic.fr'
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
    await payload.create({ collection: 'users', data: { name: 'Administrateur', email, password, role: 'admin' }, ...ctx })
    console.log(`\nCompte administrateur créé\n  identifiant : ${email}\n  mot de passe : ${password}\n`)
  }

  // Médias de référence
  async function upload(file: string, alt: string) {
    const abs = path.join(REF, file)
    if (!fs.existsSync(abs)) return null
    const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: `reference/${file}` } }, limit: 1 })
    if (found.docs[0]) return found.docs[0].id
    const doc = await payload.create({ collection: 'media', data: { alt, legacyPath: `reference/${file}` }, filePath: abs, ...ctx })
    return doc.id
  }
  const logo = await upload('logo-siteon0.png', 'Logo du PCRF')
  const banner = await upload('bandeau-lenine.jpg', 'Lénine s’adressant à la foule')

  // Rubriques et articles utiles aux menus
  const rub = async (slug: string) => (await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1 })).docs[0]?.id
  const art = async (slug: string) => (await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1 })).docs[0]?.id
  const [france, international, luttes, journal, campagnes, videos, theorie, materiel] = await Promise.all(
    ['france', 'international', 'luttes', 'journal', 'campagnes', 'videos', 'theorie', 'materiel'].map(rub),
  )
  const [quiSommesNous, liens, congres] = await Promise.all(['Qui-sommes-nous', 'Liens', 'Congres-fondateur-du-Parti'].map(art))

  // Pages fixes
  async function page(slug: string, title: string, html: string) {
    const found = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
    if (found.docs[0]) return found.docs[0].id
    const doc = await payload.create({ collection: 'pages', data: { title, slug, _status: 'published', legacy: { html } }, ...ctx })
    return doc.id
  }
  const programme = await page(
    'programme',
    'Le programme du PCRF',
    `<p><strong>Le socialisme-communisme : seule alternative au capitalisme !</strong></p>
<p>Ce programme est le premier du Parti Communiste Révolutionnaire de France. Il est issu du 1er congrès du PCRF en novembre 2019 et de la conférence nationale de juillet 2021.</p>
<p>Le fichier PDF du programme sera ajouté ici par les administrateurs du site (réglage « Page d’accueil » › « Fenêtre Programme »).</p>
${congres ? `<p><a href="/Congres-fondateur-du-Parti">Congrès fondateur, 1er Congrès, 2ème Congrès, Programme et Statuts</a></p>` : ''}`,
  )
  const don = await page(
    'don',
    'Soutenir le PCRF',
    `<p>Le PCRF ne vit que des cotisations et des dons de ses membres et sympathisants. Les dons ouvrent droit à une réduction d’impôt de 66 % du montant versé, dans la limite de 20 % du revenu imposable.</p>
<p>Le don en ligne par HelloAsso sera activé dès l’ouverture du compte par le mandataire financier.</p>
<p>Par chèque : à l’ordre de « Mandataire PCRF », à envoyer à : Amis d’Oulianov, BP 40064, 75862 Paris CEDEX 18.</p>
<p>Les partis politiques ne peuvent accepter de dons que par l’intermédiaire de leur mandataire financier. Plafond : 7 500 € par personne et par an. Les dons de personnes morales sont interdits.</p>`,
  )
  const contact = await page(
    'contact',
    'Contact',
    `<p>Pour nous écrire : <a href="mailto:ic.pcrf@gmail.com">ic.pcrf@gmail.com</a></p>
<p>Adresse postale : Amis d’Oulianov, BP 40064, 75862 Paris CEDEX 18</p>
<p>Abonnement au journal <em>Intervention Communiste</em> : 20 € pour 1 an, 10 € étudiants et privés d’emploi, 9 € e-abonnement, soutien à partir de 30 €. Chèque à l’ordre de « Mandataire PCRF ».</p>`,
  )
  await page('mentions-legales', 'Mentions légales', `<p>Éditeur : Parti Communiste Révolutionnaire de France. Directeur de la publication : à compléter. Hébergement : à compléter.</p><p>Ce site n’utilise pas de cookies de suivi.</p>`)

  // Menus
  type Link = { label: string; type: 'rubrique' | 'page' | 'article' | 'url'; rubrique?: number; page?: number; article?: number; url?: string; newTab: boolean }
  const L = (label: string, type: Link['type'], ref?: number | null, url?: string): Link => ({
    label, type, rubrique: type === 'rubrique' ? (ref ?? undefined) : undefined, page: type === 'page' ? (ref ?? undefined) : undefined, article: type === 'article' ? (ref ?? undefined) : undefined, url, newTab: type === 'url' && /^https?:/.test(url || ''),
  })
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      primary: [L('France', 'rubrique', france), L('International', 'rubrique', international), L('Luttes', 'rubrique', luttes), L('Journal', 'rubrique', journal), L('Campagnes', 'rubrique', campagnes), L('Vidéos', 'rubrique', videos)].filter((l) => l.rubrique),
      secondary: [
        quiSommesNous ? L('Qui sommes-nous ?', 'article', quiSommesNous) : null,
        materiel ? L('Matériel', 'rubrique', materiel) : null,
        L('Programme', 'page', programme),
        theorie ? L('Théorie', 'rubrique', theorie) : null,
        liens ? L('Liens', 'article', liens) : null,
        L('Archives', 'url', null, 'https://archives.pcrf-ic.fr/'),
        L('Contact', 'page', contact),
        L('Don', 'page', don),
      ].filter((l): l is Link => Boolean(l)),
      footerColumns: [
        { title: 'Le parti', links: [quiSommesNous ? L('Qui sommes-nous ?', 'article', quiSommesNous) : null, L('Programme', 'page', programme), L('Faire un don', 'page', don), L('Contact', 'page', contact), L('Archives URCF', 'url', null, 'https://archives.pcrf-ic.fr/')].filter((l): l is Link => Boolean(l)) },
        {
          title: 'Action communiste européenne',
          links: [
            L('European Communist Action', 'url', null, 'https://www.eurcomact.org/'),
            L('KKE (Grèce)', 'url', null, 'https://inter.kke.gr/fr/'),
            L('TKP (Turquie)', 'url', null, 'https://tkp.org.tr/'),
            L('PCTE (Espagne)', 'url', null, 'https://www.pcte.es/'),
            L('Fronte Comunista (Italie)', 'url', null, 'https://www.frontecomunista.it/'),
          ],
        },
      ],
    },
    ...ctx,
  })

  await payload.updateGlobal({ slug: 'site', data: { logo, bannerImage: banner, bannerEnabled: true }, ...ctx })
  await payload.updateGlobal({
    slug: 'accueil',
    data: { programmePage: programme, rubriqueBlocks: [france, international, luttes].filter((x): x is number => typeof x === 'number') },
    ...ctx,
  })
  console.log('amorçage terminé')
  process.exit(0)
}

// `payload run` attend la fin du module : il faut attendre main() ici.
await main().catch((e) => { console.error(e); process.exit(1) })
