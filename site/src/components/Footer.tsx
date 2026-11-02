import Link from 'next/link'
import type { Navigation, Site } from '@/payload-types'
import { resolveLink } from '@/lib/links'
import { SocialLinks } from './SocialLinks'

export function Footer({ site, nav }: { site: Site; nav: Navigation }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer__grid">
        <div className="footer__about">
          <p className="footer__name">{site.name}</p>
          {site.slogan && <p className="footer__slogan">« {site.slogan} »</p>}
          {site.postalAddress && <p className="footer__address">{site.postalAddress}</p>}
          {site.contactEmail && (
            <p>
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
            </p>
          )}
          <SocialLinks site={site} className="social--footer" />
        </div>
        {(nav.footerColumns ?? []).map((col) => (
          <div className="footer__col" key={col.id ?? col.title}>
            <p className="footer__title">{col.title}</p>
            <ul>
              {(col.links ?? []).map((l) => {
                const { href, external } = resolveLink(l)
                return (
                  <li key={l.id ?? l.label}>
                    {external ? (
                      <a href={href} target="_blank" rel="noopener">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={href}>{l.label}</Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap footer__bottom">
        <p>
          © 2016–{new Date().getFullYear()} {site.shortName || 'PCRF'} · <Link href="/rss.xml">Flux RSS</Link> ·{' '}
          <Link href="/mentions-legales">Mentions légales</Link>
        </p>
      </div>
    </footer>
  )
}
