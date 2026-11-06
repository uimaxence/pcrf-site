import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/access'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Réglages du site',
  admin: { group: 'Structure', description: 'Nom, bandeau, réseaux sociaux, lettre d’information, dons, contact.' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identité',
          fields: [
            { name: 'name', type: 'text', label: 'Nom du site', defaultValue: 'Parti Communiste Révolutionnaire de France', required: true },
            { name: 'shortName', type: 'text', label: 'Sigle', defaultValue: 'PCRF' },
            { name: 'slogan', type: 'text', label: 'Devise', defaultValue: 'Prolétaires de tous les pays, unissez-vous !' },
            { name: 'description', type: 'textarea', label: 'Description (pour Google et les partages)', defaultValue: 'Site du Parti Communiste Révolutionnaire de France : analyses, luttes, actualité du mouvement communiste en France et dans le monde.' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
            { name: 'bannerEnabled', type: 'checkbox', label: 'Afficher le bandeau photo en haut de l’accueil', defaultValue: true },
            { name: 'bannerImage', type: 'upload', relationTo: 'media', label: 'Image du bandeau' },
            {
              name: 'mastheadImages',
              type: 'array',
              label: 'Images défilantes incrustées dans le bandeau',
              labels: { singular: 'Image', plural: 'Images' },
              admin: { description: 'Petites images qui se succèdent dans un cadre, à droite du bandeau photo de l’accueil. Format paysage conseillé. Laisser vide pour ne rien afficher.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', label: 'Image', required: true, filterOptions: { mimeType: { contains: 'image' } } }],
            },
          ],
        },
        {
          label: 'Réseaux et contact',
          fields: [
            { name: 'facebook', type: 'text', label: 'Page Facebook (adresse)' },
            { name: 'instagram', type: 'text', label: 'Compte Instagram (adresse)' },
            { name: 'youtube', type: 'text', label: 'Chaîne YouTube (adresse)', defaultValue: 'https://www.youtube.com/channel/UCoyBtYYDy0MuqfR_P_-CVYQ' },
            { name: 'contactEmail', type: 'email', label: 'Adresse mail de contact (reçoit les messages du formulaire)', defaultValue: 'ic.pcrf@gmail.com' },
            { name: 'postalAddress', type: 'textarea', label: 'Adresse postale', defaultValue: 'Amis d’Oulianov, BP 40064, 75862 Paris CEDEX 18' },
          ],
        },
        {
          label: 'Lettre d’information',
          fields: [
            { name: 'newsletterTitle', type: 'text', label: 'Titre du bloc', defaultValue: 'Recevez nos analyses et nos rendez-vous' },
            { name: 'newsletterText', type: 'textarea', label: 'Texte', defaultValue: 'Deux fois par mois, nos articles et appels dans votre boîte mail. Désinscription en un clic.' },
            { name: 'brevoFormUrl', type: 'text', label: 'Adresse du formulaire Brevo', admin: { description: 'Lien « formulaire hébergé » de Brevo. Le bouton du site y renvoie.' } },
          ],
        },
        {
          label: 'Dons et journal',
          fields: [
            { name: 'helloassoUrl', type: 'text', label: 'Adresse HelloAsso pour les dons' },
            { name: 'donText', type: 'textarea', label: 'Texte du bloc Don', defaultValue: 'Le PCRF ne vit que des cotisations et des dons de ses membres et sympathisants. Les dons ouvrent droit à une réduction d’impôt de 66 %.' },
            { name: 'journalName', type: 'text', label: 'Nom du journal', defaultValue: 'Intervention Communiste' },
            { name: 'journalSubscribeText', type: 'textarea', label: 'Texte abonnement', defaultValue: '20 € pour 1 an, 10 € étudiants et privés d’emploi, 9 € e-abonnement, soutien à partir de 30 €. Chèque à l’ordre de « Mandataire PCRF ».' },
            { name: 'journalSubscribeUrl', type: 'text', label: 'Lien abonnement (page ou formulaire)' },
          ],
        },
      ],
    },
  ],
}
