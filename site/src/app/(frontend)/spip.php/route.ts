import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

/** Redirige les anciennes adresses SPIP encore en circulation (liens partagés, moteurs de recherche). */
export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || req.nextUrl.origin
  const q = req.nextUrl.search.replace(/^\?/, '')
  const sp = req.nextUrl.searchParams
  const go = (to: string, status: 301 | 302 = 301) => NextResponse.redirect(new URL(to, base), status)

  const art = q.match(/^article(\d+)/)
  if (art) {
    const payload = await getPayloadClient()
    const where = { 'legacy.spipId': { equals: Number(art[1]) } }
    const res = await payload.find({ collection: 'articles', where, limit: 1, depth: 0 })
    if (res.docs[0]) return go(`/${res.docs[0].slug}`)
    // Anciens articles devenus des pages (Qui sommes-nous, Liens, Mentions légales…).
    const pages = await payload.find({ collection: 'pages', where, limit: 1, depth: 0 })
    return go(pages.docs[0] ? `/${pages.docs[0].slug}` : '/')
  }
  const rub = q.match(/^rubrique(\d+)/)
  if (rub) {
    const payload = await getPayloadClient()
    const res = await payload.find({ collection: 'rubriques', where: { spipId: { equals: Number(rub[1]) } }, limit: 1, depth: 0 })
    return go(res.docs[0] ? `/rubrique/${res.docs[0].slug}` : '/')
  }
  switch (sp.get('page')) {
    case 'backend':
      return go('/rss.xml')
    case 'recherche':
      return go(`/recherche?q=${encodeURIComponent(sp.get('recherche') || '')}`, 302)
    case 'login':
      return go('/admin', 302)
    default:
      return go('/')
  }
}
