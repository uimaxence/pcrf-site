import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, publishedOrLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    group: 'Structure',
    description: 'Pages fixes : Qui sommes-nous, Programme, Liens, Contact, Don… Réservé aux administrateurs.',
  },
  access: { read: publishedOrLoggedIn, create: isAdmin, update: isAdmin, delete: isAdmin },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Image d’en-tête' },
    { name: 'content', type: 'richText', label: 'Texte' },
    slugField('title'),
    {
      name: 'legacy',
      type: 'group',
      label: 'Ancien site',
      admin: { condition: (data) => Boolean(data?.legacy?.html) },
      fields: [
        { name: 'html', type: 'code', label: 'Contenu importé (HTML)', admin: { language: 'html' }, access: { update: isAdminField } },
        { name: 'spipUrl', type: 'text', label: 'Ancienne adresse', admin: { readOnly: true } },
      ],
    },
  ],
}
