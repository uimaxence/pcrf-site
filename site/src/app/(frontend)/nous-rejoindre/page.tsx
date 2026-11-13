import type { Metadata } from 'next'
import Link from 'next/link'
import { Body } from '@/components/RichText'
import { getPageBySlug, getSite } from '@/lib/queries'
import { JoinForm } from './JoinForm'

export const metadata: Metadata = {
  title: 'Nous rejoindre',
  description: 'Rejoindre le Parti Communiste Révolutionnaire de France : dis-nous qui tu es, nous te recontactons.',
}
export const revalidate = 300

/** Texte d'introduction affiché tant que la page « nous-rejoindre » n'existe pas dans l'admin. */
const INTRO = `<p>Tu partages nos analyses et tu veux agir avec nous ? Remplis ce formulaire : un camarade te recontacte rapidement pour échanger et te proposer de rencontrer les militants près de chez toi.</p>`

export default async function JoinPage() {
  const [page, site] = await Promise.all([getPageBySlug('nous-rejoindre'), getSite()])
  const email = site.joinEmail || site.contactEmail
  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link> › Nous rejoindre
      </p>
      <article className="article">
        <header className="article__head">
          <h1 className="article__title">{page?.title || 'Nous rejoindre'}</h1>
        </header>
        {page ? <Body content={page.content} legacyHtml={page.legacy?.html} /> : <Body legacyHtml={INTRO} />}
        <section className="contact" aria-labelledby="join-form-title">
          <h2 id="join-form-title" className="contact__title">
            Dis-nous qui tu es
          </h2>
          <JoinForm />
          {email && (
            <p className="contact__alt">
              Ou directement par mail : <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
        </section>
      </article>
    </div>
  )
}
