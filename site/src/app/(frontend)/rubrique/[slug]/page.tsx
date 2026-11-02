import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { rubriqueHref } from '@/lib/links'
import { getArticlesByRubrique, getRubriqueBySlug, getRubriques } from '@/lib/queries'

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
  const [all, res] = await Promise.all([getRubriques(), getArticlesByRubrique(rubrique, page, 12)])
  const children = all.filter((r) => (typeof r.parent === 'object' && r.parent ? r.parent.id : r.parent) === rubrique.id)
  const parent = rubrique.parent && typeof rubrique.parent === 'object' ? rubrique.parent : null

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
      {res.docs.length ? (
        <div className="grid-3">
          {res.docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="empty">Aucun article dans cette rubrique pour le moment.</p>
      )}
      <Pagination page={res.page ?? 1} totalPages={res.totalPages} base={rubriqueHref(rubrique)} />
    </div>
  )
}
