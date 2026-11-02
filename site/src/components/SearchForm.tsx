export function SearchForm({ compact = false, defaultValue = '', id }: { compact?: boolean; defaultValue?: string; id?: string }) {
  const fieldId = id ?? (compact ? 'q-top' : 'q')
  return (
    <form className={`search ${compact ? 'search--compact' : ''}`} action="/recherche" method="get" role="search">
      <label className="sr-only" htmlFor={fieldId}>
        Rechercher sur le site
      </label>
      <input id={fieldId} type="search" name="q" placeholder="Rechercher…" defaultValue={defaultValue} />
      <button type="submit" aria-label="Lancer la recherche">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  )
}
