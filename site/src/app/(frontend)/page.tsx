import Link from 'next/link'
import type { Rubrique } from '@/payload-types'
import { ArticleCard } from '@/components/ArticleCard'
import { FixedWindows } from '@/components/FixedWindows'
import { Newsletter } from '@/components/Newsletter'
import { SectionTitle } from '@/components/SectionTitle'
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
  const featured = await getFeaturedArticles(accueil.featuredCount ?? 5)
  const [lead, ...side] = featured
  const latest = await getLatestArticles(accueil.latestCount ?? 6, featured.map((a) => a.id))
  const video = accueil.videoArticle && typeof accueil.videoArticle === 'object' ? accueil.videoArticle : await getLatestVideo()
  const journal =
    accueil.journalArticle && typeof accueil.journalArticle === 'object'
      ? accueil.journalArticle
      : ((await getLatestInRubriqueSlug('journal', 1))[0] ?? null)
  const blocks = (accueil.rubriqueBlocks ?? []).filter((r): r is Rubrique => typeof r === 'object')
  const blockData = await Promise.all(blocks.map(async (r) => ({ r, docs: (await getArticlesByRubrique(r, 1, 4)).docs })))
  const banner = site.bannerEnabled ? mediaUrl(site.bannerImage, 'large') : null

  return (
    <>
      {banner && (
        <div className="bandeau">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner} alt="" />
          {site.slogan && (
            <p className="bandeau__slogan">
              <span>« {site.slogan} »</span>
            </p>
          )}
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

        <FixedWindows accueil={accueil} site={site} video={video} journal={journal as never} />

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
