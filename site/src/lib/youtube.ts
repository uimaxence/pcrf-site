/** Identifiant d'une vidéo YouTube à partir de ses adresses usuelles. */
export function youtubeId(url?: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`
