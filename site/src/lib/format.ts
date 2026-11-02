const longDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return longDate.format(d)
}

/** Coupe un texte à une longueur donnée sans couper un mot. */
export function excerpt(text: string | null | undefined, max = 180): string {
  if (!text) return ''
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

/**
 * Espaces insécables de la typographie française : rien ne doit commencer une ligne
 * par « : », « ! », « ? », « ; » ou « » », ni finir une ligne par « « ».
 */
export function frTypo(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\s+([:!?;»])/g, '\u202F$1')
    .replace(/(«)\s+/g, '$1\u202F')
    .replace(/(\d)\s?€/g, '$1\u202F€')
}
