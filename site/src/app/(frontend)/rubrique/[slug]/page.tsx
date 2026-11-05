import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { rubriqueHref } from '@/lib/links'
import { SectionTitle } from '@/components/SectionTitle'
import { getArticlesByRubrique, getDirectArticles, getFamilyArticlesExcluding, getRubriqueBySlug, getRubriques, getSite } from '@/lib/queries'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const r = await getRubriqueBySlug(slug)
  return r ? { title: r.name, description: r.description || undefined, alternates: { canonical: rubriqueHref(r) } } : {}
}

export default async function RubriquePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const rubrique = await getRubriqueBySlug(slug)
  if (!rubrique) notFound()
  const all = await getRubriques()
  const children = all.filter((r) => (typeof r.parent === 'object' && r.parent ? r.parent.id : r.parent) === rubrique.id)
  // Rubrique avec sous-rubriques (ex. Matériel) : ses propres articles passent d'abord, au-dessus des tracts et affiches.
  const direct = children.length ? await getDirectArticles(rubrique) : []
  const res = direct.length ? await getFamilyArticlesExcluding(rubrique, direct.map((d) => d.id), page, 12) : await getArticlesByRubrique(rubrique, page, 12)
  const site = rubrique.slug === 'videos' ? await getSite() : null
  const youtube = site?.youtube
  const parent = rubrique.parent && typeof rubrique.parent === 'object' ? rubrique.parent : null
  // Matériel et ses sous-rubriques (affiches, tracts, brochures) : visuels en hauteur, comme les documents eux-mêmes.
  const tall = rubrique.slug === 'materiel' || parent?.slug === 'materiel'
  const gridClass = tall ? 'grid-3 grid--tall' : 'grid-3'

  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link>
        {parent && (
          <>
            {' › '}
            <Link href={rubriqueHref(parent)}>{parent.name}</Link>
          </>
        )}
        {' › '}
        {rubrique.name}
      </p>
      <header className="page-head">
        <h1>{rubrique.name}</h1>
        {rubrique.description && <p>{rubrique.description}</p>}
        {youtube && (
          <a className="yt-link" href={youtube} target="_blank" rel="noopener">
            Voir toutes nos vidéos sur YouTube <span aria-hidden="true">→</span>
          </a>
        )}
        {children.length > 0 && (
          <ul className="chips">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={rubriqueHref(c)}>{c.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {direct.length > 0 && page === 1 && (
        <section className="highlight" aria-label={`À la une dans ${rubrique.name}`}>
          <SectionTitle>À la une</SectionTitle>
          <div className="grid-3">
            {direct.map((a) => (
              <ArticleCard key={a.id} article={a} tall={tall} />
            ))}
          </div>
        </section>
      )}
      {direct.length > 0 && res.docs.length > 0 && <SectionTitle>{children.map((c) => c.name).join(' et ')}</SectionTitle>}
      {res.docs.length ? (
        <div className={gridClass}>
          {res.docs.map((a) => (
            <ArticleCard key={a.id} article={a} tall={tall} />
          ))}
        </div>
      ) : (
        <p className="empty">Aucun article dans cette rubrique pour le moment.</p>
      )}
      <Pagination page={res.page ?? 1} totalPages={res.totalPages} base={rubriqueHref(rubrique)} />
    </div>
  )
}
