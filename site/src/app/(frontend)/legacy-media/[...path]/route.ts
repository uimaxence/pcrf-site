import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

/**
 * Sert les médias récupérés de l'ancien site (images, PDF cités dans les articles importés).
 * En local : lus depuis LEGACY_MEDIA_DIR. En production : redirection vers LEGACY_MEDIA_BASE_URL (stockage S3).
 */
const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.odt': 'application/vnd.oasis.opendocument.text', '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.zip': 'application/zip',
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params
  const rel = parts.map(decodeURIComponent).join('/')
  if (rel.includes('..')) return new NextResponse('Not found', { status: 404 })
  const baseUrl = process.env.LEGACY_MEDIA_BASE_URL
  if (baseUrl) return NextResponse.redirect(`${baseUrl.replace(/\/$/, '')}/${rel}`, 301)
  const dir = path.resolve(process.cwd(), process.env.LEGACY_MEDIA_DIR || '../migration/media')
  const abs = path.resolve(dir, rel)
  if (!abs.startsWith(dir) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) return new NextResponse('Not found', { status: 404 })
  const type = TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream'
  const data = await fs.promises.readFile(abs)
  return new NextResponse(data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
