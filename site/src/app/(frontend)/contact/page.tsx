import type { Metadata } from 'next'
import Link from 'next/link'
import { Body } from '@/components/RichText'
import { getPageBySlug, getSite } from '@/lib/queries'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = { title: 'Contact' }
export const revalidate = 300

export default async function ContactPage() {
  const [page, site] = await Promise.all([getPageBySlug('contact'), getSite()])
  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/">Accueil</Link> › Contact
      </p>
      <article className="article">
        <header className="article__head">
          <h1 className="article__title">{page?.title || 'Contact'}</h1>
        </header>
        <Body content={page?.content} legacyHtml={page?.legacy?.html} />
        <section className="contact" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="contact__title">
            Nous écrire
          </h2>
          <ContactForm />
          {site.contactEmail && (
            <p className="contact__alt">
              Ou directement par mail : <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
            </p>
          )}
        </section>
      </article>
    </div>
  )
}
