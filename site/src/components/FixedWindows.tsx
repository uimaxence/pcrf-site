import Link from 'next/link'
import type { Accueil, Article, Site } from '@/payload-types'
import { excerpt, frTypo } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { youtubeId, youtubeThumb } from '@/lib/youtube'
import { articleImage } from './ArticleCard'

type Props = { accueil: Accueil; site: Site; video: Article | null; journal: Article | null }

/**
 * Les trois fenêtres fixes de l'accueil : Programme, Dernière vidéo, Journal.
 * Les trois partagent le même squelette (étiquette, visuel 16/9, titre, texte,
 * pied calé en bas) pour rester alignées quelle que soit la longueur des contenus.
 */
export function FixedWindows({ accueil, site, video, journal }: Props) {
  const programmeCover = mediaUrl(accueil.programmeCover, 'card')
  // Feuilles « qui se soulèvent » : les pages d'aperçu si elles existent, sinon la couverture seule.
  const pages = (accueil.programmePages ?? []).map((p) => mediaUrl(p.image, 'card')).filter((u): u is string => !!u)
  const sheets = (pages.length ? pages : programmeCover ? [programmeCover] : []).slice(0, 3)
  const programmePdf = mediaUrl(accueil.programmePdf, 'original')
  const programmeHref =
    programmePdf || (accueil.programmePage && typeof accueil.programmePage === 'object' ? `/${accueil.programmePage.slug}` : '/programme')
  const programmeTarget = programmePdf ? '_blank' : undefined

  const yt = youtubeId(video?.videoUrl)
  const videoHref = video ? `/${video.slug}` : '/rubrique/videos'

  const journalImg = journal ? articleImage(journal, 'card') : null
  const journalHref = journal ? `/${journal.slug}` : '/rubrique/journal'
  const journalName = site.journalName || 'Journal'

  return (
    <section className="windows" aria-label="À retenir">
      <article className="window window--programme">
        <p className="window__label">Programme</p>
        <Link href={programmeHref} className={`window__visual window__visual--programme${sheets.length ? ' window__visual--sheets' : ''}`} target={programmeTarget} tabIndex={-1} aria-hidden="true">
          <span className="window__slogan">{frTypo('Le socialisme-communisme : seule alternative au capitalisme !')}</span>
          {sheets.length > 0 && (
            <span className="sheets" data-count={sheets.length}>
              {sheets.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className={`sheet sheet--${i + 1}`} loading="lazy" />
              ))}
            </span>
          )}
        </Link>
        <h3 className="window__title">
          <Link href={programmeHref} target={programmeTarget}>
            {frTypo(accueil.programmeTitle || 'Le programme du PCRF')}
          </Link>
        </h3>
        {accueil.programmeText && <p className="window__text">{frTypo(accueil.programmeText)}</p>}
        <div className="window__foot">
          <Link className="btn btn--red btn--small" href={programmeHref} target={programmeTarget}>
            {programmePdf ? 'Lire le programme (PDF)' : 'Lire le programme'}
          </Link>
        </div>
      </article>

      <article className="window window--video">
        <p className="window__label">{accueil.videoTitle || 'Dernière vidéo'}</p>
        {video && yt ? (
          <>
            <Link href={videoHref} className="window__visual window__visual--video" tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youtubeThumb(yt)} alt="" />
              <span className="play" />
            </Link>
            <h3 className="window__title">
              <Link href={videoHref}>{frTypo(video.title)}</Link>
            </h3>
            {video.chapo && <p className="window__text">{frTypo(excerpt(video.chapo, 150))}</p>}
          </>
        ) : (
          <>
            <span className="window__visual window__visual--video" aria-hidden="true">
              <span className="play" />
            </span>
            <p className="window__text">Aucune vidéo publiée pour le moment.</p>
          </>
        )}
        <div className="window__foot">
          <Link className="btn btn--red btn--small" href={video && yt ? videoHref : '/rubrique/videos'}>
            {video && yt ? 'Voir la vidéo' : 'Toutes les vidéos'}
          </Link>
          {video && yt ? (
            <Link className="window__more" href="/rubrique/videos">
              Toutes les vidéos →
            </Link>
          ) : (
            site.youtube && (
              <a className="window__more" href={site.youtube} target="_blank" rel="noopener">
                Chaîne YouTube →
              </a>
            )
          )}
        </div>
      </article>

      <article className="window window--journal">
        <p className="window__label">{accueil.journalTitle || journalName}</p>
        <Link href={journalHref} className="window__visual window__visual--journal" tabIndex={-1} aria-hidden="true">
          {journalImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={journalImg.src} alt="" />
          ) : (
            <span className="window__slogan">{journalName}</span>
          )}
        </Link>
        <h3 className="window__title">
          <Link href={journalHref}>{frTypo(journal ? journal.title : journalName)}</Link>
        </h3>
        {site.journalSubscribeText && <p className="window__text">{frTypo(site.journalSubscribeText)}</p>}
        <div className="window__foot">
          <Link className="btn btn--red btn--small" href={site.journalSubscribeUrl || '/rubrique/journal'}>
            S’abonner
          </Link>
          <Link className="window__more" href="/rubrique/journal">
            Tous les numéros →
          </Link>
        </div>
      </article>
    </section>
  )
}
