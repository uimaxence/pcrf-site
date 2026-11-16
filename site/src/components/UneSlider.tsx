'use client'

import { Children, useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  /** Une carte « lead » par article, rendue côté serveur. */
  children: ReactNode
  /** Titres des articles, dans le même ordre : ils nomment les points de navigation. */
  labels: string[]
  /** Durée d'affichage d'un article, en millisecondes. */
  interval: number
}

/**
 * Diaporama « À la une » : les articles choisis dans Page d'accueil se fondent l'un dans l'autre dans le grand emplacement.
 * Le passage automatique est cadencé par l'animation du trait rouge sous le diaporama (fin de l'animation = article suivant) :
 * il se met en pause avec elle (souris, clavier, bouton) et disparaît quand le visiteur a demandé moins d'animations.
 * Sans JavaScript, le premier article reste affiché.
 */
export function UneSlider({ children, labels, interval }: Props) {
  const slides = Children.toArray(children)
  const n = slides.length
  const [current, setCurrent] = useState(0)
  const [hover, setHover] = useState(false)
  const [stopped, setStopped] = useState(false)
  const paused = hover || stopped
  const touchStart = useRef<number | null>(null)

  const go = useCallback((i: number) => setCurrent(((i % n) + n) % n), [n])

  return (
    <section
      className={`slider${paused ? ' slider--paused' : ''}`}
      aria-roledescription="carrousel"
      aria-label="À la une"
      style={{ '--slider-interval': `${interval}ms` } as CSSProperties}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(current - 1)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(current + 1)
        }
      }}
    >
      <div
        className="slider__track"
        aria-live={paused ? 'polite' : 'off'}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') touchStart.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (touchStart.current === null) return
          const dx = e.clientX - touchStart.current
          touchStart.current = null
          if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1)
        }}
        onPointerCancel={() => {
          touchStart.current = null
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`slider__slide${i === current ? ' is-on' : ''}`}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${n}`}
            aria-hidden={i !== current}
            inert={i !== current || undefined}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="slider__nav">
        <button type="button" className="slider__btn" onClick={() => go(current - 1)} aria-label="Article précédent">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ol className="slider__dots">
          {labels.map((label, i) => (
            <li key={i}>
              <button
                type="button"
                className={`slider__dot${i === current ? ' is-on' : ''}`}
                onClick={() => go(i)}
                aria-label={`Afficher : ${label}`}
                aria-current={i === current ? 'true' : undefined}
              >
                {i === current && <span className="slider__fill" onAnimationEnd={() => go(current + 1)} />}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="slider__btn" onClick={() => go(current + 1)} aria-label="Article suivant">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="m5 2 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="slider__btn slider__btn--pause"
          onClick={() => setStopped((s) => !s)}
          aria-pressed={stopped}
          aria-label={stopped ? 'Reprendre le défilement' : 'Mettre en pause le défilement'}
        >
          {stopped ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 1.5v9l8-4.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 1.5h2.8v9H2zM7.2 1.5H10v9H7.2z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </section>
  )
}
