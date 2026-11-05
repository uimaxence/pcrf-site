import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { CongresView } from '@/components/CongresView'

export const revalidate = 300

type Props = { params: Promise<{ n: string }> }

export function generateStaticParams() {
  return []
}

function pageNumber(n: string) {
  return /^\d+$/.test(n) ? Number(n) : 0
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = pageNumber((await params).n)
  return { title: `Congrès (page ${page})`, alternates: { canonical: `/congres/page/${page}` } }
}

export default async function CongresPageN({ params }: Props) {
  const page = pageNumber((await params).n)
  if (page < 1) notFound()
  if (page === 1) permanentRedirect('/congres')
  return <CongresView page={page} />
}
