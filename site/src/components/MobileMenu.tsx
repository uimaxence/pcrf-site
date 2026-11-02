'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type MenuItem = { label: string; href: string; external: boolean }

type Props = {
  name: string
  primary: MenuItem[]
  secondary: MenuItem[]
  newsletterUrl?: string | null
  /** Recherche et réseaux sociaux : rendus côté serveur, placés dans le panneau. */
  search: ReactNode
  social: ReactNode
}

function Item({ item, index, current, onNavigate }: { item: MenuItem; index: number; current: boolean; onNavigate: () => void }) {
  const style = { '--i': index } as React.CSSProperties
  return (
    <li style={style}>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noopener" onClick={onNavigate}>
          {item.label}
        </a>
      ) : (
        <Link href={item.href} aria-current={current ? 'page' : undefined} onClick={onNavigate}>
          {item.label}
        </Link>
      )}
    </li>
  )
}

/** Menu des petits écrans : un bouton dans la barre du haut ouvre un panneau avec toute la navigation. */
export function MobileMenu({ name, primary, secondary, newsletterUrl, search, social }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const burger = useRef<HTMLButtonElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  // Fermer à chaque changement de page.
  useEffect(() => setOpen(false), [pathname])

  // Échap pour fermer, défilement de la page bloqué pendant l'ouverture, focus rendu au bouton à la fermeture.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      close.current?.focus()
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
      document.addEventListener('keydown', onKey)
      wasOpen.current = true
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKey)
      }
    }
    if (wasOpen.current) burger.current?.focus()
    return undefined
  }, [open])

  // Repli automatique si l'écran s'élargit (rotation, redimensionnement).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`))
  const done = () => setOpen(false)

  return (
    <>
      <button
        ref={burger}
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="mmenu"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="burger__icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="burger__label">Menu</span>
      </button>

      <div id="mmenu" className="mmenu" data-open={open} inert={!open} role="dialog" aria-modal="true" aria-label="Menu principal">
        <div className="mmenu__backdrop" onClick={done} />
        <div className="mmenu__panel">
          <div className="mmenu__head">
            <span className="mmenu__name">{name}</span>
            <button ref={close} type="button" className="mmenu__close" onClick={done} aria-label="Fermer le menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <div className="mmenu__search">{search}</div>

          <nav aria-label="Rubriques">
            <ul className="mmenu__list mmenu__list--primary">
              {primary.map((item, i) => (
                <Item key={item.label + item.href} item={item} index={i} current={isCurrent(item.href)} onNavigate={done} />
              ))}
            </ul>
          </nav>

          {secondary.length > 0 && (
            <nav aria-label="Informations">
              <ul className="mmenu__list mmenu__list--secondary">
                {secondary.map((item, i) => (
                  <Item key={item.label + item.href} item={item} index={primary.length + i} current={isCurrent(item.href)} onNavigate={done} />
                ))}
              </ul>
            </nav>
          )}

          <div className="mmenu__foot">
            <div className="mmenu__actions">
              <Link className="btn btn--red" href="/don" onClick={done}>
                Faire un don
              </Link>
              {newsletterUrl && (
                <a className="btn btn--ghost" href={newsletterUrl} target="_blank" rel="noopener">
                  Lettre d’info
                </a>
              )}
            </div>
            {social}
          </div>
        </div>
      </div>
    </>
  )
}
