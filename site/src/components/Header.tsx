import Link from 'next/link'
import type { Navigation, Site } from '@/payload-types'
import { resolveLink } from '@/lib/links'
import { mediaUrl } from '@/lib/media'
import { SearchForm } from './SearchForm'
import { SocialLinks } from './SocialLinks'

function NavRow({ items, className }: { items: Navigation['primary']; className: string }) {
  if (!items?.length) return null
  return (
    <nav className={`nav ${className}`} aria-label="Menu">
      <ul className="wrap nav__list">
        {items.map((item) => {
          const { href, external } = resolveLink(item)
          return (
            <li key={item.id ?? item.label}>
              {external || item.newTab ? (
                <a href={href} target="_blank" rel="noopener">
                  {item.label}
                </a>
              ) : (
                <Link href={href}>{item.label}</Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function Header({ site, nav }: { site: Site; nav: Navigation }) {
  const logo = mediaUrl(site.logo, 'original')
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="wrap topbar__in">
          <SocialLinks site={site} />
          <SearchForm compact />
          <div className="topbar__actions">
            {site.brevoFormUrl && (
              <a className="btn btn--ghost" href={site.brevoFormUrl} target="_blank" rel="noopener">
                Lettre d’info
              </a>
            )}
            <Link className="btn btn--red" href="/don">
              Faire un don
            </Link>
          </div>
        </div>
      </div>
      <div className="wrap masthead">
        <Link className="masthead__logo" href="/" aria-label="Accueil">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={site.shortName || 'PCRF'} width={180} height={99} />
          ) : (
            <span className="masthead__sigle">{site.shortName || 'PCRF'}</span>
          )}
        </Link>
        <div className="masthead__text">
          <p className="masthead__name">{site.name}</p>
          {site.slogan && <p className="masthead__slogan">{site.slogan}</p>}
        </div>
      </div>
      <NavRow items={[{ label: 'Accueil', type: 'url', url: '/' }, ...(nav.primary ?? [])]} className="nav--primary" />
      <NavRow items={nav.secondary} className="nav--secondary" />
    </header>
  )
}
