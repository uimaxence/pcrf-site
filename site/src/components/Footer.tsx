import Link from 'next/link'
import type { Navigation, Site } from '@/payload-types'
import { resolveLink } from '@/lib/links'
import { SocialLinks } from './SocialLinks'

type FooterNavLink = NonNullable<NonNullable<Navigation['footerColumns']>[number]['links']>[number]

function FooterLink({ link }: { link: FooterNavLink }) {
  const { href, external } = resolveLink(link)
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener">
          {link.label}
        </a>
      ) : (
        <Link href={href}>{link.label}</Link>
      )}
    </li>
  )
}

export function Footer({ site, nav }: { site: Site; nav: Navigation }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer__grid">
        <div className="footer__about">
          <p className="footer__name">{site.name}</p>
          {site.slogan && <p className="footer__slogan">{site.slogan}</p>}
          {site.postalAddress && <p className="footer__address">{site.postalAddress}</p>}
          {site.contactEmail && (
            <p>
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
            </p>
          )}
          <SocialLinks site={site} className="social--footer" />
        </div>
        {(nav.footerColumns ?? []).map((col) => {
          const links = col.links ?? []
          // « Deux colonnes » : le premier lien reste en pleine largeur (en-tête), les suivants se répartissent sur deux colonnes.
          const [head, ...rest] = col.twoColumns ? links : []
          return (
            <div className={`footer__col${col.twoColumns ? ' footer__col--two' : ''}`} key={col.id ?? col.title}>
              <p className="footer__title">{col.title}</p>
              {col.twoColumns && head ? (
                <>
                  <ul>
                    <FooterLink link={head} />
                  </ul>
                  <div className="footer__twocols">
                    {[rest.slice(0, Math.ceil(rest.length / 2)), rest.slice(Math.ceil(rest.length / 2))].map((half, i) => (
                      <ul key={i}>
                        {half.map((l) => (
                          <FooterLink key={l.id ?? l.label} link={l} />
                        ))}
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <ul>
                  {links.map((l) => (
                    <FooterLink key={l.id ?? l.label} link={l} />
                  ))}
                </ul>
              )}
            </div>
          )
        })}
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
