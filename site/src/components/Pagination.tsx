import Link from 'next/link'

export function Pagination({ page, totalPages, base }: { page: number; totalPages: number; base: string }) {
  if (totalPages <= 1) return null
  // Rubriques : /rubrique/x/page/2 (pages statiques). Recherche (adresse avec « ? ») : &page=2.
  const href = (p: number) => (p === 1 ? base : base.includes('?') ? `${base}&page=${p}` : `${base}/page/${p}`)
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev">
          ← Plus récents
        </Link>
      ) : (
        <span />
      )}
      <span className="pagination__count">
        Page {page} sur {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next">
          Plus anciens →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
