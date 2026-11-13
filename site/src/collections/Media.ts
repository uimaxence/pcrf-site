import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isLoggedIn } from '@/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    group: 'Contenu',
    description: 'Images et documents (PDF) utilisés dans les articles et les pages.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Fichiers publics : le CDN les garde un jour, le navigateur une heure. Sans cela chaque image relance une fonction serveur.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
      return headers
    },
    imageSizes: [
      { name: 'thumbnail', width: 400, withoutEnlargement: true },
      { name: 'card', width: 800, withoutEnlargement: true },
      { name: 'large', width: 1400, withoutEnlargement: true },
      // Bandeau de l'accueil : affiché sur toute la largeur de l'écran, il a besoin de plus que « large ».
      { name: 'banner', width: 2400, withoutEnlargement: true },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Description de l’image (pour les malvoyants et Google)' },
    { name: 'caption', type: 'text', label: 'Légende' },
    {
      name: 'legacyPath',
      type: 'text',
      label: 'Chemin dans l’ancien site',
      index: true,
      admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.legacyPath) },
    },
  ],
}
