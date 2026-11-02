import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Rubriques: CollectionConfig = {
  slug: 'rubriques',
  labels: { singular: 'Rubrique', plural: 'Rubriques' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order'],
    group: 'Structure',
    description: 'Les grandes catégories du site (France, International, Luttes…). Réservé aux administrateurs.',
  },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  defaultSort: 'order',
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    slugField('name'),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'rubriques',
      label: 'Rubrique parente',
      admin: { position: 'sidebar', description: 'Laisser vide pour une rubrique principale.' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'order', type: 'number', label: 'Ordre d’affichage', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'description', type: 'textarea', label: 'Présentation (affichée en haut de la rubrique)' },
    {
      name: 'spipId',
      type: 'number',
      label: 'Identifiant SPIP',
      index: true,
      admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.spipId) },
    },
    {
      name: 'legacySlug',
      type: 'text',
      label: 'Adresse dans l’ancien site',
      index: true,
      admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.legacySlug) },
    },
  ],
}
