import { excerpt } from '@/lib/format'
import { getLatestArticles, getSite } from '@/lib/queries'

export const revalidate = 300

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const [site, latest] = await Promise.all([getSite(), getLatestArticles(30)])
  const items = latest.docs
    .map((a) => {
      const rub = a.rubrique && typeof a.rubrique === 'object' ? a.rubrique.name : ''
      return `<item>
  <title>${esc(a.title)}</title>
  <link>${base}/${a.slug}</link>
  <guid isPermaLink="true">${base}/${a.slug}</guid>
  <pubDate>${new Date(a.date).toUTCString()}</pubDate>
  ${rub ? `<category>${esc(rub)}</category>` : ''}
  <description>${esc(excerpt(a.chapo, 400))}</description>
</item>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(site.name)}</title>
  <link>${base}/</link>
  <description>${esc(site.description || '')}</description>
  <language>fr</language>
  <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
