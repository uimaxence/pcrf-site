import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isLoggedIn, publishedOrLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rubrique', 'date', '_status'],
    group: 'Contenu',
    description: 'Écrire un article : titre, rubrique, image, texte. Enregistrer comme brouillon ou publier.',
    listSearchableFields: ['title', 'chapo'],
    pagination: { defaultLimit: 25 },
    preview: (doc) => `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/${doc?.slug}`,
  },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  defaultSort: '-date',
  // Brouillons : « Enregistrer le brouillon » / « Publier ». Pas d'enregistrement automatique pour éviter les brouillons vides.
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', required: true },
    {
      name: 'chapo',
      type: 'textarea',
      label: 'Chapeau',
      admin: { description: 'Deux ou trois phrases de résumé, affichées en liste et en tête de l’article.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Image principale', filterOptions: { mimeType: { contains: 'image' } } },
    { name: 'content', type: 'richText', label: 'Texte' },
    {
      name: 'documents',
      type: 'array',
      label: 'Documents joints',
      labels: { singular: 'Document', plural: 'Documents' },
      admin: { description: 'PDF ou images proposés en téléchargement sous l’article (tract, affiche, brochure).' },
      fields: [
        { name: 'file', type: 'upload', relationTo: 'media', label: 'Fichier', required: true },
        { name: 'label', type: 'text', label: 'Intitulé' },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Vidéo YouTube',
      admin: { description: 'Coller le lien de la vidéo (rubrique Vidéos). Elle s’affiche en haut de l’article.' },
    },
    // Barre latérale
    {
      name: 'rubrique',
      type: 'relationship',
      relationTo: 'rubriques',
      label: 'Rubrique',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Date de publication',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } },
      index: true,
    },
    { name: 'featured', type: 'checkbox', label: 'Mettre à la une', defaultValue: false, admin: { position: 'sidebar' }, index: true },
    { name: 'auteur', type: 'text', label: 'Signature', admin: { position: 'sidebar', description: 'Facultatif.' } },
    slugField('title'),
    // Contenu importé de SPIP
    {
      name: 'legacy',
      type: 'group',
      label: 'Ancien site',
      admin: { condition: (data) => Boolean(data?.legacy?.html || data?.legacy?.spipUrl) },
      fields: [
        {
          name: 'html',
          type: 'code',
          label: 'Contenu importé (HTML)',
          admin: {
            language: 'html',
            description: 'Texte récupéré de l’ancien site. Il s’affiche tant que le champ « Texte » est vide.',
          },
          access: { update: isAdminField },
        },
        { name: 'spipUrl', type: 'text', label: 'Ancienne adresse', admin: { readOnly: true } },
        { name: 'spipId', type: 'number', label: 'Identifiant SPIP', admin: { readOnly: true }, index: true },
      ],
    },
  ],
}
