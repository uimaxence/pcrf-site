import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { RubriqueView, rubriqueMetadata } from '@/components/RubriqueView'

export const revalidate = 300

type Props = { params: Promise<{ slug: string; n: string }> }

/** Pages suivantes d'une rubrique : générées à la première visite, puis gardées en cache. */
export function generateStaticParams() {
  return []
}

function pageNumber(n: string) {
  return /^\d+$/.test(n) ? Number(n) : 0
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params
  return rubriqueMetadata(slug, pageNumber(n))
}

export default async function RubriquePageN({ params }: Props) {
  const { slug, n } = await params
  const page = pageNumber(n)
  if (page < 1) notFound()
  if (page === 1) permanentRedirect(`/rubrique/${slug}`)
  return <RubriqueView slug={slug} page={page} />
}
