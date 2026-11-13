'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
export const THEME_KEY = 'pcrf-theme'

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
const getSnapshot = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
const getServerSnapshot = (): Theme => 'light'

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* navigation privée : le choix ne survit pas à la fermeture de l'onglet */
  }
  listeners.forEach((cb) => cb())
}

/** Bouton « mode nuit » : fond sombre sur tout le site, mémorisé dans le navigateur. Le choix est lu avant le rendu (script dans le layout). */
export function ThemeToggle({ className = '', withLabel = false }: { className?: string; withLabel?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className={`theme ${className}`.trim()}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-pressed={dark}
      aria-label={dark ? 'Désactiver le mode nuit' : 'Activer le mode nuit'}
      title={dark ? 'Mode jour' : 'Mode nuit'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
      {withLabel && <span>{dark ? 'Mode jour' : 'Mode nuit'}</span>}
    </button>
  )
}
