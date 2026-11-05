import { cache } from 'react'
import type { Article, Rubrique } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const ARTICLE_LIST_SELECT = {
  title: true,
  slug: true,
  chapo: true,
  cover: true,
  date: true,
  rubrique: true,
  videoUrl: true,
  featured: true,
  coverPosition: true,
  coverFit: true,
} as const

/** Filtre commun : écarte les articles masqués (case « Visible sur le site » décochée). */
export const VISIBLE = { visible: { not_equals: false } } as const

export const getSite = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site', depth: 1 })
})
export async function getNavigation() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'navigation', depth: 2 })
}
export async function getAccueil() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'accueil', depth: 2 })
}

export async function getRubriques(): Promise<Rubrique[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'rubriques', limit: 100, sort: 'order', depth: 0 })
  return res.docs
}

export async function getRubriqueBySlug(slug: string): Promise<Rubrique | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'rubriques', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
}
export async function getRubriqueByLegacySlug(legacySlug: string): Promise<Rubrique | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'rubriques', where: { legacySlug: { equals: legacySlug } }, limit: 1, depth: 0 })
  return res.docs[0] ?? null
}

/** Identifiants d'une rubrique et de ses sous-rubriques. */
export async function rubriqueFamilyIds(rubrique: Rubrique): Promise<(number | string)[]> {
  const all = await getRubriques()
  const ids: (number | string)[] = [rubrique.id]
  let frontier = [rubrique.id]
  while (frontier.length) {
    const children = all.filter((r) => {
      const p = typeof r.parent === 'object' && r.parent ? r.parent.id : r.parent
      return p != null && frontier.includes(p)
    })
    frontier = children.map((c) => c.id)
    ids.push(...frontier)
  }
  return ids
}

export async function getLatestArticles(limit = 6, excludeIds: (number | string)[] = []) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'articles',
    where: excludeIds.length ? { and: [VISIBLE, { id: { not_in: excludeIds } }] } : VISIBLE,
    sort: '-date',
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
}

export async function getFeaturedArticles(limit = 3) {
  const payload = await getPayloadClient()
  const featured = await payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { featured: { equals: true } }] },
    sort: '-date',
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
  // Des articles sont cochés « à la une » : on n'affiche qu'eux.
  if (featured.docs.length > 0) return featured.docs
  // Aucun article coché : on affiche les plus récents.
  return (await getLatestArticles(limit)).docs
}

export async function getArticlesByRubrique(rubrique: Rubrique, page = 1, limit = 12) {
  const payload = await getPayloadClient()
  const ids = await rubriqueFamilyIds(rubrique)
  return payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { rubrique: { in: ids } }] },
    sort: '-date',
    page,
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'articles', where: { and: [VISIBLE, { slug: { equals: slug } }] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
}
export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
}
export async function getArticleBySpipId(id: number): Promise<Article | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'articles', where: { 'legacy.spipId': { equals: id } }, limit: 1, depth: 0 })
  return res.docs[0] ?? null
}

export async function getLatestVideo(): Promise<Article | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { videoUrl: { like: 'youtu' } }] },
    sort: '-date',
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export async function getLatestInRubriqueSlug(slug: string, limit = 1) {
  const r = await getRubriqueBySlug(slug)
  if (!r) return []
  const res = await getArticlesByRubrique(r, 1, limit)
  return res.docs
}

export async function searchArticles(q: string, page = 1, limit = 20) {
  const payload = await getPayloadClient()
  const term = q.trim()
  return payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { or: [{ title: { like: term } }, { chapo: { like: term } }, { 'legacy.html': { like: term } }] }] },
    sort: '-date',
    page,
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
}

/** Articles directement rattachés à une rubrique (sans ses sous-rubriques). */
export async function getDirectArticles(rubrique: Rubrique) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { rubrique: { equals: rubrique.id } }] },
    sort: '-date',
    limit: 50,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
  return res.docs
}

/** Articles d'une rubrique et de ses sous-rubriques, sans une liste d'identifiants. */
export async function getFamilyArticlesExcluding(rubrique: Rubrique, excludeIds: (number | string)[], page = 1, limit = 12) {
  const payload = await getPayloadClient()
  const ids = await rubriqueFamilyIds(rubrique)
  return payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { rubrique: { in: ids } }, ...(excludeIds.length ? [{ id: { not_in: excludeIds } }] : [])] },
    sort: '-date',
    page,
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
}

/** Articles liés à un congrès (titre ou chapeau), du plus récent au plus ancien. */
export async function getCongresArticles(page = 1, limit = 24) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'articles',
    where: { and: [VISIBLE, { or: [{ title: { like: 'congrès' } }, { title: { like: 'congres' } }, { chapo: { like: 'congrès' } }] }] },
    sort: '-date',
    page,
    limit,
    depth: 1,
    select: ARTICLE_LIST_SELECT,
  })
}
