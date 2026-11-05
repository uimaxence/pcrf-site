import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Article, Page as PageDoc, Rubrique } from '@/payload-types'
import { ArticleCard, articleImage } from '@/components/ArticleCard'
import { Body } from '@/components/RichText'
import { SectionTitle } from '@/components/SectionTitle'
import { YouTube } from '@/components/YouTube'
import { excerpt, formatDate, frTypo } from '@/lib/format'
import { rubriqueHref } from '@/lib/links'
import { mediaAlt, mediaDoc, mediaUrl } from '@/lib/media'
import { getArticleBySlug, getArticlesByRubrique, getPageBySlug, getRubriqueByLegacySlug, getSite } from '@/lib/queries'

export const revalidate = 300
export const dynamicParams = true
/** Aucune page construite d'avance : chacune est générée à la première visite puis gardée en cache (purgé à chaque modification). */
export function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

async function load(slugRaw: string) {
  const slug = decodeURIComponent(slugRaw)
  if (/^-.+-$/.test(slug)) {
    const r = await getRubriqueByLegacySlug(slug)
    if (r) permanentRedirect(`/rubrique/${r.slug}`)
    notFound()
  }
  const page = await getPageBySlug(slug)
  if (page) return { page, article: null as Article | null }
  const article = await getArticleBySlug(slug)
  if (!article) notFound()
  return { page: null as PageDoc | null, article }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { page, article } = await load(slug)
  const doc = page ?? article!
  const img = article ? articleImage(article, 'large') : mediaUrl(page?.cover, 'large')
  const description = article ? excerpt(article.chapo || article.legacy?.html || '', 200) : undefined
  return {
    title: doc.title,
    description,
    alternates: { canonical: `/${doc.slug}` },
    openGraph: {
      title: doc.title,
      description,
      type: article ? 'article' : 'website',
      url: `/${doc.slug}`,
      images: img ? [typeof img === 'string' ? img : img.src] : undefined,
      publishedTime: article?.date,
    },
  }
}

function rubriqueChain(r: Rubrique | number | string | null | undefined): Rubrique[] {
  const chain: Rubrique[] = []
  let cur = r
  while (cur && typeof cur === 'object') {
    chain.unshift(cur)
    cur = cur.parent
  }
  return chain
}

export default async function SlugPage({ params }: Params) {
  const { slug } = await params
  const { page, article } = await load(slug)
  const site = await getSite()

  if (page) {
    const cover = mediaUrl(page.cover, 'large')
    return (
      <div className="wrap">
        <p className="crumbs">
          <Link href="/">Accueil</Link> › {page.title}
        </p>
        <article className="article">
          <header className="article__head">
            <h1 className="article__title">{frTypo(page.title)}</h1>
          </header>
          {cover && (
            <figure className="article__cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={mediaAlt(page.cover)} />
            </figure>
          )}
          <Body content={page.content} legacyHtml={page.legacy?.html} />
        </article>
      </div>
    )
  }

  const a = article!
  const chain = rubriqueChain(a.rubrique)
  const rub = chain[chain.length - 1]
  const cover = mediaDoc(a.cover)
  const coverUrl = mediaUrl(a.cover, 'large')
  const related = rub ? (await getArticlesByRubrique(rub, 1, 4)).docs.filter((d) => d.id !== a.id).slice(0, 3) : []
  const shareUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/${a.slug}`

  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link>
        {chain.map((r) => (
          <span key={r.id}>
            {' › '}
            <Link href={rubriqueHref(r)}>{r.name}</Link>
          </span>
        ))}
      </p>
      <article className="article">
        <header className="article__head">
          {rub && (
            <Link className="eyebrow" href={rubriqueHref(rub)}>
              {rub.name}
            </Link>
          )}
          <h1 className="article__title">{frTypo(a.title)}</h1>
          <div className="article__meta">
            <time dateTime={a.date}>{formatDate(a.date)}</time>
          </div>
          {a.chapo && <p className="article__chapo">{frTypo(a.chapo)}</p>}
        </header>
        {a.videoUrl ? (
          <YouTube url={a.videoUrl} title={a.title} />
        ) : (
          coverUrl && (
            <figure className={`article__cover${chain.some((r) => r.slug === 'campagnes') ? ' article__cover--campagne' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt={mediaAlt(a.cover)} />
              {cover?.caption && <figcaption>{cover.caption}</figcaption>}
            </figure>
          )
        )}
        <Body content={a.content} legacyHtml={a.legacy?.html} />
        {a.documents && a.documents.length > 0 && (
          <section className="docs" aria-labelledby="docs-title">
            <h2 id="docs-title">Documents à télécharger</h2>
            <ul>
              {a.documents.map((d) => {
                const url = mediaUrl(d.file, 'original')
                const m = mediaDoc(d.file)
                return url ? (
                  <li key={d.id}>
                    <a href={url} target="_blank" rel="noopener">
                      {d.label || m?.alt || m?.filename}
                    </a>
                  </li>
                ) : null
              })}
            </ul>
          </section>
        )}
        <footer className="share">
          <span>Partager</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener">
            Facebook
          </a>
          <a href={`mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(shareUrl)}`}>Par mail</a>
          {site.contactEmail && <a href={`mailto:${site.contactEmail}`}>Nous écrire</a>}
        </footer>
      </article>
      {related.length > 0 && rub && (
        <section className="related wrap-inner">
          <SectionTitle href={rubriqueHref(rub)}>Dans la rubrique {rub.name}</SectionTitle>
          <div className="grid-3">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
