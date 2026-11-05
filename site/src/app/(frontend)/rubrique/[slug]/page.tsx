import type { Metadata } from 'next'
import { RubriqueView, rubriqueMetadata } from '@/components/RubriqueView'
import { getRubriques } from '@/lib/queries'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

/** Les rubriques sont construites d'avance ; une rubrique créée ensuite est générée à sa première visite. */
export async function generateStaticParams() {
  return (await getRubriques()).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return rubriqueMetadata((await params).slug)
}

export default async function RubriquePage({ params }: Props) {
  return <RubriqueView slug={(await params).slug} page={1} />
}
