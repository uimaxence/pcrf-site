import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { getCongresArticles } from '@/lib/queries'

/** Page Congrès. La pagination passe par l'adresse (/congres/page/2) pour que chaque page soit mise en cache. */
export async function CongresView({ page }: { page: number }) {
  const res = await getCongresArticles(page, 24)
  if (page > 1 && page > res.totalPages) notFound()
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
