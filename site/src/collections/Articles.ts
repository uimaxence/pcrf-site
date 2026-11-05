import type { CollectionConfig } from 'payload'
import { articlesPublicRead, isAdmin, isAdminField, isLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rubrique', 'date', 'featured', 'visible', '_status'],
    group: 'Contenu',
    description: 'Écrire un article : titre, rubrique, image, texte. Enregistrer comme brouillon ou publier.',
    listSearchableFields: ['title', 'chapo'],
    pagination: { defaultLimit: 25 },
    preview: (doc) => `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/${doc?.slug}`,
  },
  access: { read: articlesPublicRead, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
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
    {
      name: 'coverPosition',
      type: 'select',
      label: 'Cadrage de l’image dans les listes',
      defaultValue: 'center',
      options: [
        { label: 'Centre', value: 'center' },
        { label: 'Haut (garder le haut de l’image)', value: 'top' },
        { label: 'Bas (garder le bas de l’image)', value: 'bottom' },
        { label: 'Gauche (garder la gauche de l’image)', value: 'left' },
        { label: 'Droite (garder la droite de l’image)', value: 'right' },
      ],
      admin: {
        description:
          'Quand l’image est recadrée dans les listes, choisir la partie à garder visible. Vérifier le résultat avec le bouton « Aperçu » avant de publier.',
        condition: (data) => Boolean(data?.cover),
      },
    },
    {
      name: 'coverFit',
      type: 'select',
      label: 'Affichage de l’image dans les listes',
      defaultValue: 'cover',
      options: [
        { label: 'Remplir le cadre (l’image est recadrée)', value: 'cover' },
        { label: 'Image entière, sans recadrage (logo, affiche, capture)', value: 'contain' },
      ],
      admin: {
        description: 'Choisir « Image entière » pour un logo, une affiche ou une capture d’écran qu’il ne faut pas couper.',
        condition: (data) => Boolean(data?.cover),
      },
    },
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
    {
      name: 'featured',
      type: 'checkbox',
      label: 'À la une',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Cocher pour afficher l’article en haut de la page d’accueil.' },
      index: true,
    },
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Visible sur le site',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Décocher pour masquer l’article sans le supprimer.' },
      index: true,
    },
    // Signature : plus affichée sur le site. Le champ reste en base mais n’est plus proposé.
    { name: 'auteur', type: 'text', label: 'Signature', admin: { hidden: true } },
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
