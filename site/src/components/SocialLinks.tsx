import type { Site } from '@/payload-types'

const icons = {
  facebook: 'M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm5.3-1.3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  youtube: 'M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3L10 15z',
}

export function SocialLinks({ site, className = '' }: { site: Site; className?: string }) {
  const items = [
    ['facebook', site.facebook, 'Facebook'],
    ['instagram', site.instagram, 'Instagram'],
    ['youtube', site.youtube, 'YouTube'],
  ] as const
  const present = items.filter(([, url]) => Boolean(url))
  if (!present.length) return <div />
  return (
    <ul className={`social ${className}`}>
      {present.map(([key, url, label]) => (
        <li key={key}>
          <a href={url!} target="_blank" rel="noopener" aria-label={label} title={label}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={icons[key]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
