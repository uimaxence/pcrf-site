'use client'

import { useEffect, useState } from 'react'

/** Petites images incrustées à droite du bandeau photo, qui se fondent l'une dans l'autre. Fixe si une seule image ou si l'animation est réduite. */
export function BandeauSlides({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setCurrent((i) => (i + 1) % images.length), 4500)
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null
  return (
    <div className="bandeau__slides" aria-hidden="true">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" className={i === current ? 'is-on' : undefined} loading={i === 0 ? 'eager' : 'lazy'} />
      ))}
    </div>
  )
}
