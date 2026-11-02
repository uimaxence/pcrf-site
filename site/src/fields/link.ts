import type { Field } from 'payload'

/** Un lien de menu : vers une rubrique, une page, un article ou une adresse externe. */
export const linkField = (name = 'links', label = 'Liens'): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Lien', plural: 'Liens' },
  fields: [
    { name: 'label', type: 'text', label: 'Intitulé', required: true },
    {
      name: 'type',
      type: 'select',
      label: 'Type de lien',
      required: true,
      defaultValue: 'rubrique',
      options: [
        { label: 'Rubrique', value: 'rubrique' },
        { label: 'Page', value: 'page' },
        { label: 'Article', value: 'article' },
        { label: 'Adresse web', value: 'url' },
      ],
    },
    {
      name: 'rubrique',
      type: 'relationship',
      relationTo: 'rubriques',
      label: 'Rubrique',
      admin: { condition: (_, siblingData) => siblingData?.type === 'rubrique' },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Page',
      admin: { condition: (_, siblingData) => siblingData?.type === 'page' },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      label: 'Article',
      admin: { condition: (_, siblingData) => siblingData?.type === 'article' },
    },
    {
      name: 'url',
      type: 'text',
      label: 'Adresse web',
      admin: { condition: (_, siblingData) => siblingData?.type === 'url' },
    },
    { name: 'newTab', type: 'checkbox', label: 'Ouvrir dans un nouvel onglet', defaultValue: false },
  ],
})
