import type { Metadata } from 'next'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { SearchForm } from '@/components/SearchForm'
import { searchArticles } from '@/lib/queries'

export const metadata: Metadata = { title: 'Recherche', robots: { index: false } }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = '', page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const term = q.trim()
  const res = term.length >= 2 ? await searchArticles(term, page) : null
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>Recherche</h1>
        <SearchForm defaultValue={term} />
      </header>
      {res ? (
        res.docs.length ? (
          <>
            <p className="crumbs">
              {res.totalDocs} résultat{res.totalDocs > 1 ? 's' : ''} pour « {term} »
            </p>
            <div className="grid-3" style={{ marginTop: 20 }}>
              {res.docs.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            <Pagination page={res.page ?? 1} totalPages={res.totalPages} base={`/recherche?q=${encodeURIComponent(term)}`} />
          </>
        ) : (
          <p className="empty">Aucun article ne correspond à « {term} ». Essayez un autre mot.</p>
        )
      ) : (
        <p className="empty">Saisissez un mot ou une expression (deux lettres au moins).</p>
      )}
    </div>
  )
}
