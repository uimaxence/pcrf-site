import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { linkField } from '@/fields/link'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menus',
  admin: { group: 'Structure', description: 'Les deux lignes de menu en haut du site et les colonnes du pied de page.' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    linkField('primary', 'Première ligne (rubriques d’actualité)'),
    linkField('secondary', 'Deuxième ligne (le parti, ses documents)'),
    {
      name: 'footerColumns',
      type: 'array',
      label: 'Colonnes du pied de page',
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      fields: [{ name: 'title', type: 'text', label: 'Titre', required: true }, linkField('links')],
    },
  ],
}
