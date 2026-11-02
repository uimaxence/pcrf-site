import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administration',
    description: 'Les personnes autorisées à écrire sur le site.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: isAdmin,
    update: ({ req: { user } }) => (user?.role === 'admin' ? true : { id: { equals: user?.id } }),
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      defaultValue: 'redacteur',
      options: [
        { label: 'Rédacteur : écrit et publie des articles', value: 'redacteur' },
        { label: 'Administrateur : gère aussi les rubriques, les menus et les comptes', value: 'admin' },
      ],
      access: { update: isAdminField, create: isAdminField },
      saveToJWT: true,
    },
  ],
}
