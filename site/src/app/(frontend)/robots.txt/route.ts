export const revalidate = 3600

export function GET() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const body = ['User-Agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '', `Sitemap: ${base}/sitemap.xml`, ''].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
