import type { Navigation, Rubrique } from '@/payload-types'

type NavLink = NonNullable<Navigation['primary']>[number]

export function rubriqueHref(r: Rubrique | number | string | null | undefined): string {
  if (!r || typeof r !== 'object') return '#'
  return `/rubrique/${r.slug}`
}

/** Résout un lien de menu vers son adresse. */
export function resolveLink(link: NavLink): { href: string; external: boolean } {
  switch (link.type) {
    case 'rubrique':
      return { href: rubriqueHref(link.rubrique), external: false }
    case 'page':
      return { href: link.page && typeof link.page === 'object' ? `/${link.page.slug}` : '#', external: false }
    case 'article':
      return { href: link.article && typeof link.article === 'object' ? `/${link.article.slug}` : '#', external: false }
    default:
      return { href: link.url || '#', external: /^https?:\/\//.test(link.url || '') }
  }
}
