import Link from 'next/link'

export function Pagination({ page, totalPages, base }: { page: number; totalPages: number; base: string }) {
  if (totalPages <= 1) return null
  const href = (p: number) => (p === 1 ? base : `${base}${base.includes('?') ? '&' : '?'}page=${p}`)
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
