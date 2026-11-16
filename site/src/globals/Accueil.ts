import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'

export const Accueil: GlobalConfig = {
  slug: 'accueil',
  label: 'Page d’accueil',
  admin: { group: 'Structure', description: 'Le diaporama « À la une », les trois fenêtres fixes (Programme, Vidéo, Journal) et le nombre d’articles affichés.' },
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
              maxRows: 10,
              label: 'Articles du diaporama',
              admin: {
                appearance: 'drawer',
                isSortable: true,
                allowCreate: false,
                description:
                  'Cliquer dans le champ pour choisir un article dans la liste. Ils défilent l’un après l’autre dans le grand emplacement « À la une », dans cet ordre : faire glisser les étiquettes pour les réordonner. Les articles masqués ou en brouillon sont ignorés. Laisser vide : le dernier article coché « À la une » occupe seul le grand emplacement.',
              },
            },
            {
              name: 'featuredInterval',
              type: 'number',
              label: 'Durée d’affichage de chaque article (secondes)',
              defaultValue: 7,
              min: 3,
              max: 30,
              admin: { description: 'Le défilement s’arrête quand la souris est sur le diaporama ; le visiteur peut aussi le mettre en pause ou passer d’un article à l’autre.' },
            },
            {
              name: 'featuredCount',
              type: 'number',
              label: 'Articles à la une (le grand emplacement + les autres en colonne)',
              defaultValue: 4,
              min: 2,
              max: 7,
              admin: { description: 'La colonne de droite reprend les articles cochés « À la une » qui ne sont pas dans le diaporama, puis les plus récents.' },
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
