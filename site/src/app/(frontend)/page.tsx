import Link from 'next/link'
import type { Article, Rubrique } from '@/payload-types'
import { ArticleCard, type ArticleLite } from '@/components/ArticleCard'
import { BandeauSlides } from '@/components/BandeauSlides'
import { FixedWindows } from '@/components/FixedWindows'
import { Newsletter } from '@/components/Newsletter'
import { SectionTitle } from '@/components/SectionTitle'
import { rubriqueHref } from '@/lib/links'
import { mediaDoc, mediaUrl } from '@/lib/media'
import {
  getAccueil,
  getArticlesByRubrique,
  getFeaturedArticles,
  getLatestArticles,
  getLatestInRubriqueSlug,
  getLatestVideo,
  getSite,
} from '@/lib/queries'

export const revalidate = 300

export default async function HomePage() {
  const [site, accueil] = await Promise.all([getSite(), getAccueil()])
  // À la une : les articles choisis dans Page d'accueil › À la une, dans l'ordre (le premier en grand, les suivants en colonne),
  // complétés par les articles cochés « À la une » puis par les plus récents.
  const featuredCount = accueil.featuredCount ?? 4
  const chosen = (accueil.featuredArticles ?? [])
    .filter((a): a is Article => typeof a === 'object' && a.visible !== false && a._status !== 'draft')
    .slice(0, featuredCount)
  const fill = chosen.length < featuredCount ? await getFeaturedArticles(featuredCount - chosen.length, chosen.map((a) => a.id)) : []
  const [lead, ...side]: ArticleLite[] = [...chosen, ...fill]
  const latest = await getLatestArticles(accueil.latestCount ?? 6, [lead, ...side].filter((a) => a).map((a) => a.id!))
  const video = accueil.videoArticle && typeof accueil.videoArticle === 'object' ? accueil.videoArticle : await getLatestVideo()
  // Fenêtre Journal : le numéro choisi dans l'admin (sinon le dernier), puis les numéros précédents pour les feuilles.
  const latestIssues = await getLatestInRubriqueSlug('journal', 3)
  const journal = accueil.journalArticle && typeof accueil.journalArticle === 'object' ? accueil.journalArticle : (latestIssues[0] ?? null)
  const issues = journal ? [journal, ...latestIssues.filter((a) => a.id !== journal.id)].slice(0, 3) : []
  const blocks = (accueil.rubriqueBlocks ?? []).filter((r): r is Rubrique => typeof r === 'object')
  const blockData = await Promise.all(blocks.map(async (r) => ({ r, docs: (await getArticlesByRubrique(r, 1, 4)).docs })))
  const banner = site.bannerEnabled ? mediaUrl(site.bannerImage, 'banner') : null
  // Cadre 3 × 2 : une photo qui y perdrait plus d'un tiers (panorama au-delà de 2,25:1, carrée ou verticale) est affichée entière sur fond flouté, sauf choix contraire dans l'admin.
  const slides = (site.mastheadImages ?? []).flatMap((m) => {
    const src = mediaUrl(m.image, 'card')
    if (!src) return []
    const media = mediaDoc(m.image)
    const ratio = media?.width && media?.height ? media.width / media.height : 1.5
    const contain = m.fit === 'contain' || (m.fit !== 'cover' && (ratio >= 2.25 || ratio <= 1))
    return [{ src, contain }]
  })

  return (
    <>
      {banner && (
        <div className="bandeau">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner} alt="" />
          <BandeauSlides slides={slides} />
        </div>
      )}
      <div className="wrap">
        <SectionTitle>À la une</SectionTitle>
        {lead ? (
          <div className="une">
            <ArticleCard article={lead} variant="lead" />
            <div className="une__side">
              {side.map((a) => (
                <ArticleCard key={a.id} article={a} variant="row" />
              ))}
            </div>
          </div>
        ) : (
          <p className="empty">Aucun article publié pour le moment.</p>
        )}

        <FixedWindows accueil={accueil} site={site} video={video} journal={journal} issues={issues} />

        <SectionTitle href="/recherche" hint="Rechercher">
          Derniers articles
        </SectionTitle>
        <div className="grid-3">
          {latest.docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        {blockData.length > 0 && (
          <div className="rubblocks">
            {blockData.map(({ r, docs }) => (
              <section key={r.id} aria-labelledby={`rub-${r.id}`}>
                <div className="tranche tranche--small">
                  <h2 className="tranche__title" id={`rub-${r.id}`}>
                    <Link href={rubriqueHref(r)}>{r.name}</Link>
                  </h2>
                  <Link className="tranche__more" href={rubriqueHref(r)}>
                    Tout voir →
                  </Link>
                </div>
                <div className="rubblock__list">
                  {docs.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <Newsletter site={site} />
    </>
  )
}
