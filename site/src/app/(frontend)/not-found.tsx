import Link from 'next/link'
import { SearchForm } from '@/components/SearchForm'

export default function NotFound() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>Page introuvable</h1>
        <p>Cette adresse ne correspond à aucun article. Elle a peut-être changé lors de la refonte du site.</p>
      </header>
      <SearchForm />
      <p style={{ marginTop: 24 }}>
        <Link href="/">← Retour à l’accueil</Link>
      </p>
    </div>
  )
}
