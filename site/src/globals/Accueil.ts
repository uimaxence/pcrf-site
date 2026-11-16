import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'

export const Accueil: GlobalConfig = {
  slug: 'accueil',
  label: 'Page d’accueil',
  admin: { group: 'Structure', description: 'Les articles à la une, les trois fenêtres fixes (Programme, Vidéo, Journal) et le nombre d’articles affichés.' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Fenêtre Programme',
          fields: [
            { name: 'programmeTitle', type: 'text', label: 'Titre', defaultValue: 'Le programme du PCRF' },
            { name: 'programmeText', type: 'textarea', label: 'Texte', defaultValue: 'Le socialisme-communisme : seule alternative au capitalisme ! Adopté au 1er congrès.' },
            {
              name: 'programmePages',
              type: 'array',
              label: 'Pages du programme (aperçu)',
              labels: { singular: 'Page', plural: 'Pages' },
              maxRows: 3,
              admin: {
                description:
                  '2 ou 3 images de pages (par exemple la couverture et une page intérieure). Elles s’affichent comme des feuilles qui se soulèvent au survol. La première est devant.',
              },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Image de la page', filterOptions: { mimeType: { contains: 'image' } } }],
            },
            { name: 'programmeCover', type: 'upload', relationTo: 'media', label: 'Image de couverture (si pas de pages d’aperçu)' },
            { name: 'programmePdf', type: 'upload', relationTo: 'media', label: 'Fichier PDF du programme' },
            { name: 'programmePage', type: 'relationship', relationTo: 'pages', label: 'Page à ouvrir (si pas de PDF)' },
          ],
        },
        {
          label: 'Fenêtre Vidéo',
          fields: [
            { name: 'videoTitle', type: 'text', label: 'Titre', defaultValue: 'Dernière vidéo' },
            {
              name: 'videoArticle',
              type: 'relationship',
              relationTo: 'articles',
              label: 'Article vidéo à afficher',
              admin: { description: 'Laisser vide : la dernière vidéo publiée est affichée automatiquement.' },
            },
          ],
        },
        {
          label: 'Fenêtre Journal',
          fields: [
            { name: 'journalTitle', type: 'text', label: 'Titre', defaultValue: 'Intervention Communiste' },
            {
              name: 'journalArticle',
              type: 'relationship',
              relationTo: 'articles',
              label: 'Numéro à afficher',
              admin: { description: 'Laisser vide : le dernier numéro publié dans la rubrique Journal est affiché.' },
            },
          ],
        },
        {
          label: 'À la une',
          fields: [
            {
              name: 'featuredArticles',
              type: 'relationship',
              relationTo: 'articles',
              hasMany: true,
              maxRows: 7,
              label: 'Articles à la une, dans l’ordre',
              admin: {
                appearance: 'drawer',
                isSortable: true,
                allowCreate: false,
                description:
                  'Cliquer dans le champ pour choisir un article dans la liste. Le premier s’affiche en grand, les suivants dans la colonne de droite, dans cet ordre : faire glisser les étiquettes pour les réordonner. Les places restantes sont complétées par les articles cochés « À la une » puis par les plus récents. Les articles masqués ou en brouillon sont ignorés.',
              },
            },
            {
              name: 'featuredCount',
              type: 'number',
              label: 'Nombre d’articles à la une (1 grand + les autres en colonne)',
              defaultValue: 4,
              min: 2,
              max: 7,
            },
          ],
        },
        {
          label: 'Listes',
          fields: [
            { name: 'latestCount', type: 'number', label: 'Derniers articles', defaultValue: 6, min: 3, max: 12 },
            {
              name: 'rubriqueBlocks',
              type: 'relationship',
              relationTo: 'rubriques',
              hasMany: true,
              label: 'Rubriques mises en avant en bas de l’accueil',
            },
          ],
        },
      ],
    },
  ],
}
