import Link from 'next/link'
import type { Article } from '@/payload-types'
import { formatDate, excerpt, frTypo } from '@/lib/format'
import { mediaUrl, mediaAlt } from '@/lib/media'
import { rubriqueHref } from '@/lib/links'
import { youtubeId, youtubeThumb } from '@/lib/youtube'

type Props = { article: Partial<Article> & Pick<Article, 'title' | 'slug'>; variant?: 'card' | 'lead' | 'row' | 'compact' }

/** Au-delà de cette longueur, le titre est composé un cran plus petit (puis coupé par le CSS). */
const LONG_TITLE = 90

export function articleImage(article: Partial<Article>, size: 'thumbnail' | 'card' | 'large' = 'card') {
  const url = mediaUrl(article.cover, size)
  if (url) return { src: url, alt: mediaAlt(article.cover, '') }
  const yt = youtubeId(article.videoUrl)
  if (yt) return { src: youtubeThumb(yt), alt: '' }
  return null
}

export function ArticleCard({ article, variant = 'card' }: Props) {
  const img = articleImage(article, variant === 'lead' ? 'large' : variant === 'compact' ? 'thumbnail' : 'card')
  const rub = article.rubrique && typeof article.rubrique === 'object' ? article.rubrique : null
  const href = `/${article.slug}`
  const title = frTypo(article.title.trim())
  const titleClass = `card__title${title.length > LONG_TITLE ? ' card__title--long' : ''}`
  const showChapo = (variant === 'card' || variant === 'lead') && !!article.chapo
  return (
    <article className={`card card--${variant}`}>
      {img ? (
        <Link className="card__media" href={href} tabIndex={-1} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt="" loading={variant === 'lead' ? 'eager' : 'lazy'} />
        </Link>
      ) : (
        <Link className="card__media card__media--empty" href={href} tabIndex={-1} aria-hidden="true">
          <span>PCRF</span>
        </Link>
      )}
      <div className="card__body">
        {rub && (
          <Link className="eyebrow" href={rubriqueHref(rub)}>
            {rub.name}
          </Link>
        )}
        <h3 className={titleClass}>
          <Link href={href} title={title.length > LONG_TITLE ? title : undefined}>
            {title}
          </Link>
        </h3>
        {showChapo && <p className="card__chapo">{frTypo(excerpt(article.chapo, variant === 'lead' ? 240 : 140))}</p>}
        {article.date && (
          <time className="card__date" dateTime={article.date}>
            {formatDate(article.date)}
          </time>
        )}
      </div>
    </article>
  )
}
