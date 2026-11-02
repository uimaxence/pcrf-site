import { youtubeEmbed, youtubeId } from '@/lib/youtube'

export function YouTube({ url, title }: { url?: string | null; title: string }) {
  const id = youtubeId(url)
  if (!id) return null
  return (
    <div className="video">
      <iframe
        src={youtubeEmbed(id)}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
