'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'

export type BandeauSlide = { src: string; contain: boolean }

/** Petites images incrustées à droite du bandeau photo, qui se fondent l'une dans l'autre. Fixe si une seule image ou si l'animation est réduite.
 *  Une image « entière » (contain) n'est pas recadrée : elle est posée sur une version floutée d'elle-même qui remplit le cadre. */
export function BandeauSlides({ slides }: { slides: BandeauSlide[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 4500)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null
  return (
    <div className="bandeau__slides" aria-hidden="true">
      {slides.map(({ src, contain }, i) => (
        <div key={`${i}-${src}`} className={['bandeau__slide', contain && 'bandeau__slide--contain', i === current && 'is-on'].filter(Boolean).join(' ')}>
          {contain && <img src={src} alt="" className="bandeau__slide__bg" loading={i === 0 ? 'eager' : 'lazy'} />}
          <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
        </div>
      ))}
    </div>
  )
}
