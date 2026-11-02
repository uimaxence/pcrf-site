import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { getCongresArticles } from '@/lib/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Congrès',
  description: 'Congrès fondateur, 1er et 2ème congrès, textes adoptés, programme et statuts du PCRF.',
  alternates: { canonical: '/congres' },
}

type Props = { searchParams: Promise<{ page?: string }> }

export default async function CongresPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const res = await getCongresArticles(page, 24)
  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link> › Congrès
      </p>
      <header className="page-head">
        <h1>Congrès</h1>
        <p>Congrès fondateur, 1er et 2ème congrès, textes adoptés, programme et statuts, saluts des partis frères : tous les articles liés aux congrès.</p>
      </header>
      {res.docs.length ? (
        <div className="grid-3">
          {res.docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="empty">Aucun article sur les congrès pour le moment.</p>
      )}
      <Pagination page={res.page ?? 1} totalPages={res.totalPages} base="/congres" />
    </div>
  )
}
