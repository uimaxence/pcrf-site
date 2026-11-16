import Link from 'next/link'
import type { Article, Rubrique } from '@/payload-types'
import { ArticleCard, type ArticleLite } from '@/components/ArticleCard'
import { BandeauSlides } from '@/components/BandeauSlides'
import { FixedWindows } from '@/components/FixedWindows'
import { Newsletter } from '@/components/Newsletter'
import { SectionTitle } from '@/components/SectionTitle'
import { UneSlider } from '@/components/UneSlider'
import { rubriqueHref } from '@/lib/links'
import { mediaUrl } from '@/lib/media'
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
  // À la une : le grand emplacement montre les articles du diaporama (Page d'accueil › À la une) dans l'ordre choisi ;
  // sinon le premier article coché « À la une ». La colonne reprend les autres articles cochés, puis les plus récents.
  const featuredCount = accueil.featuredCount ?? 4
  const chosen = (accueil.featuredArticles ?? []).filter(
    (a): a is Article => typeof a === 'object' && a.visible !== false && a._status !== 'draft',
  )
  let une: ArticleLite[]
  let side: ArticleLite[]
  if (chosen.length > 0) {
    une = chosen
    side = await getFeaturedArticles(Math.max(1, featuredCount - 1), chosen.map((a) => a.id))
  } else {
    const featured = await getFeaturedArticles(featuredCount)
    une = featured.slice(0, 1)
    side = featured.slice(1)
  }
  const latest = await getLatestArticles(accueil.latestCount ?? 6, [...une, ...side].map((a) => a.id!))
  const video = accueil.videoArticle && typeof accueil.videoArticle === 'object' ? accueil.videoArticle : await getLatestVideo()
  // Fenêtre Journal : le numéro choisi dans l'admin (sinon le dernier), puis les numéros précédents pour les feuilles.
  const latestIssues = await getLatestInRubriqueSlug('journal', 3)
  const journal = accueil.journalArticle && typeof accueil.journalArticle === 'object' ? accueil.journalArticle : (latestIssues[0] ?? null)
  const issues = journal ? [journal, ...latestIssues.filter((a) => a.id !== journal.id)].slice(0, 3) : []
  const blocks = (accueil.rubriqueBlocks ?? []).filter((r): r is Rubrique => typeof r === 'object')
  const blockData = await Promise.all(blocks.map(async (r) => ({ r, docs: (await getArticlesByRubrique(r, 1, 4)).docs })))
  const banner = site.bannerEnabled ? mediaUrl(site.bannerImage, 'banner') : null
  const slides = (site.mastheadImages ?? []).map((m) => mediaUrl(m.image, 'card')).filter((u): u is string => !!u)

  return (
    <>
      {banner && (
        <div className="bandeau">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner} alt="" />
          <BandeauSlides images={slides} />
        </div>
      )}
      <div className="wrap">
        <SectionTitle>À la une</SectionTitle>
        {une.length > 0 ? (
          <div className="une">
            {une.length > 1 ? (
              <UneSlider labels={une.map((a) => a.title)} interval={(accueil.featuredInterval ?? 7) * 1000}>
                {une.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="lead" />
                ))}
              </UneSlider>
            ) : (
              <ArticleCard article={une[0]} variant="lead" />
            )}
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
