import type { Field } from 'payload'
import { slugify } from '@/lib/slugify'

/** Champ "slug" : fin de l'adresse de la page, générée à partir d'un autre champ si laissée vide. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Adresse (slug)',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: "Fin de l'adresse de la page. Laissez vide : elle est créée à partir du titre.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return value.trim()
        const base = data?.[from]
        return typeof base === 'string' && base.trim() ? slugify(base) : value
      },
    ],
  },
})
