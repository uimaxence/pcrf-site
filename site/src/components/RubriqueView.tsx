import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { rubriqueHref } from '@/lib/links'
import { SectionTitle } from '@/components/SectionTitle'
import { DIRECT_LIMIT, getArticlesByRubrique, getDirectArticles, getFamilyArticlesExcluding, getRubriqueBySlug, getRubriques, getSite } from '@/lib/queries'

/** Titre, description et adresse canonique d'une page de rubrique. */
export async function rubriqueMetadata(slug: string, page = 1): Promise<Metadata> {
  const r = await getRubriqueBySlug(slug)
  if (!r) return {}
  const base = rubriqueHref(r)
  return {
    title: page > 1 ? `${r.name} (page ${page})` : r.name,
    description: r.description || undefined,
    alternates: { canonical: page > 1 ? `${base}/page/${page}` : base },
  }
}

/** Page d'une rubrique. La pagination passe par l'adresse (/rubrique/x/page/2) pour que chaque page soit mise en cache. */
export async function RubriqueView({ slug, page }: { slug: string; page: number }) {
  const rubrique = await getRubriqueBySlug(slug)
  if (!rubrique) notFound()
  const all = await getRubriques()
  const children = all.filter((r) => (typeof r.parent === 'object' && r.parent ? r.parent.id : r.parent) === rubrique.id)
  const parent = rubrique.parent && typeof rubrique.parent === 'object' ? rubrique.parent : null
  // Matériel et ses sous-rubriques (affiches, tracts, brochures) : visuels en hauteur, comme les documents eux-mêmes.
  const tall = rubrique.slug === 'materiel' || parent?.slug === 'materiel'
  const gridClass = tall ? 'grid-3 grid--tall' : 'grid-3'
  // Rubrique avec sous-rubriques (ex. Matériel) : ses propres articles passent d'abord, « à la une ».
  const direct = children.length ? await getDirectArticles(rubrique) : []
  // Rubrique « vitrine » : tous ses articles en propre tiennent à la une, le reste est dans les sous-rubriques.
  // Elle montre alors une ligne par sous-rubrique, chacune renvoyant à sa liste complète, et n'a qu'une seule page.
  const hub = children.length > 0 && direct.length < DIRECT_LIMIT
  if (hub && page > 1) notFound()
  const perRow = tall ? 4 : 3
  const sections = hub
    ? (await Promise.all(children.map(async (c) => ({ rubrique: c, res: await getArticlesByRubrique(c, 1, perRow) })))).filter((s) => s.res.docs.length > 0)
    : []
  const res = hub
    ? null
    : direct.length
      ? await getFamilyArticlesExcluding(rubrique, direct.map((d) => d.id), page, 12)
      : await getArticlesByRubrique(rubrique, page, 12)
  if (res && page > 1 && page > res.totalPages) notFound()
  const site = rubrique.slug === 'videos' ? await getSite() : null
  const youtube = site?.youtube

  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link>
        {parent && (
          <>
            {' › '}
            <Link href={rubriqueHref(parent)}>{parent.name}</Link>
          </>
        )}
        {' › '}
        {rubrique.name}
      </p>
      <header className="page-head">
        <h1>{rubrique.name}</h1>
        {rubrique.description && <p>{rubrique.description}</p>}
        {youtube && (
          <a className="yt-link" href={youtube} target="_blank" rel="noopener">
            Voir toutes nos vidéos sur YouTube <span aria-hidden="true">→</span>
          </a>
        )}
        {children.length > 0 && (
          <ul className="chips">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={rubriqueHref(c)}>{c.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {direct.length > 0 && page === 1 && (
        <section className="highlight" aria-label={`À la une dans ${rubrique.name}`}>
          <SectionTitle>À la une</SectionTitle>
          <div className="grid-3">
            {direct.map((a) => (
              <ArticleCard key={a.id} article={a} tall={tall} />
            ))}
          </div>
        </section>
      )}
      {sections.map((s) => (
        <section key={s.rubrique.id}>
          <SectionTitle href={rubriqueHref(s.rubrique)} hint={`Tout voir (${s.res.totalDocs})`}>
            {s.rubrique.name}
          </SectionTitle>
          <div className={gridClass}>
            {s.res.docs.map((a) => (
              <ArticleCard key={a.id} article={a} tall={tall} />
            ))}
          </div>
        </section>
      ))}
      {hub && sections.length === 0 && direct.length === 0 && <p className="empty">Aucun article dans cette rubrique pour le moment.</p>}
      {res && (
        <>
          {direct.length > 0 && res.docs.length > 0 && <SectionTitle>{children.map((c) => c.name).join(' et ')}</SectionTitle>}
          {res.docs.length ? (
            <div className={gridClass}>
              {res.docs.map((a) => (
                <ArticleCard key={a.id} article={a} tall={tall} />
              ))}
            </div>
          ) : (
            <p className="empty">Aucun article dans cette rubrique pour le moment.</p>
          )}
          <Pagination page={res.page ?? 1} totalPages={res.totalPages} base={rubriqueHref(rubrique)} />
        </>
      )}
    </div>
  )
}
