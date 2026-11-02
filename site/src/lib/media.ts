import type { Media } from '@/payload-types'

type MediaRef = Media | number | string | null | undefined

export function mediaDoc(ref: MediaRef): Media | null {
  return ref && typeof ref === 'object' ? ref : null
}

/** Adresse d'une image dans la taille demandée, avec repli sur l'original. */
export function mediaUrl(ref: MediaRef, size: 'thumbnail' | 'card' | 'large' | 'original' = 'card'): string | null {
  const m = mediaDoc(ref)
  if (!m) return null
  if (size !== 'original') {
    const s = m.sizes?.[size]
    if (s?.url) return s.url
  }
  return m.url || null
}

export function mediaAlt(ref: MediaRef, fallback = ''): string {
  const m = mediaDoc(ref)
  return m?.alt || m?.caption || fallback
}
