import Link from 'next/link'

/** La « tranche » rouge : titre de section en capitales, avec lien facultatif. */
export function SectionTitle({ children, href, hint }: { children: React.ReactNode; href?: string; hint?: string }) {
  return (
    <div className="tranche">
      <h2 className="tranche__title">{href ? <Link href={href}>{children}</Link> : children}</h2>
      {href && (
        <Link className="tranche__more" href={href}>
          {hint ?? 'Tout voir'} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}
