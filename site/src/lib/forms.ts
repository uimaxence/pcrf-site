/** Garde-fous communs aux formulaires publics (contact, nous rejoindre). */

const recent = new Map<string, number[]>()

/** Vrai si la même clé (adresse mail) a déjà envoyé plus de `max` messages dans la fenêtre donnée. */
export function tooMany(key: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const list = (recent.get(key) || []).filter((t) => now - t < windowMs)
  list.push(now)
  recent.set(key, list)
  return list.length > max
}

export const validEmail = (email: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

/** Champ texte nettoyé (espaces) et borné à `max` caractères. */
export const field = (formData: FormData, name: string, max: number): string => String(formData.get(name) || '').trim().slice(0, max)
