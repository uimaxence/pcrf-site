import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payload = await getPayloadClient()
  const [articles, rubriques, pages] = await Promise.all([
    payload.find({ collection: 'articles', pagination: false, depth: 0, select: { slug: true, updatedAt: true }, sort: '-date' }),
    payload.find({ collection: 'rubriques', pagination: false, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', pagination: false, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    ...rubriques.docs.map((r) => ({ url: `${base}/rubrique/${r.slug}`, lastModified: r.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...pages.docs.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...articles.docs.map((a) => ({ url: `${base}/${a.slug}`, lastModified: a.updatedAt, priority: 0.5 })),
  ]
}
