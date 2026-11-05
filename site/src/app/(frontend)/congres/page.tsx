import type { Metadata } from 'next'
import { CongresView } from '@/components/CongresView'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Congrès',
  description: 'Congrès fondateur, 1er et 2ème congrès, textes adoptés, programme et statuts du PCRF.',
  alternates: { canonical: '/congres' },
}

export default function CongresPage() {
  return <CongresView page={1} />
}
