import type { Site } from '@/payload-types'

export function Newsletter({ site }: { site: Site }) {
  return (
    <section className="newsletter" aria-labelledby="nl-title">
      <div className="wrap newsletter__in">
        <div>
          <h2 id="nl-title">{site.newsletterTitle || 'Recevez nos analyses'}</h2>
          {site.newsletterText && <p>{site.newsletterText}</p>}
        </div>
        {site.brevoFormUrl ? (
          <a className="btn btn--red" href={site.brevoFormUrl} target="_blank" rel="noopener">
            Je m’inscris
          </a>
        ) : (
          <p className="newsletter__soon">Inscription bientôt disponible.</p>
        )}
      </div>
    </section>
  )
}
