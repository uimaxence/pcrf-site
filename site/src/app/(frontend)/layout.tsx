import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'
import './globals.css'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getNavigation, getSite } from '@/lib/queries'

// Polices hébergées avec le site (aucune dépendance à Google au chargement ni à la construction).
const display = localFont({ src: '../../fonts/bebas-neue.woff2', weight: '400', variable: '--font-display', display: 'swap' })
const body = localFont({ src: '../../fonts/inter-variable.woff2', weight: '100 900', variable: '--font-body', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: site.name, template: `%s · ${site.shortName || 'PCRF'}` },
    description: site.description || undefined,
    openGraph: { siteName: site.name, locale: 'fr_FR', type: 'website' },
    alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, nav] = await Promise.all([getSite(), getNavigation()])
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#contenu">
          Aller au contenu
        </a>
        <Header site={site} nav={nav} />
        <main id="contenu">{children}</main>
        <Footer site={site} nav={nav} />
      </body>
    </html>
  )
}
