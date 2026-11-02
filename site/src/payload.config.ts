import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { fr } from '@payloadcms/translations/languages/fr'
import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Rubriques } from './collections/Rubriques'
import { Users } from './collections/Users'
import { Accueil } from './globals/Accueil'
import { Navigation } from './globals/Navigation'
import { Site } from './globals/Site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Stockage des fichiers : disque local par défaut, S3 compatible (R2, Scaleway, Cellar…) si S3_BUCKET est défini.
const useS3 = Boolean(process.env.S3_BUCKET)
// Envoi de mails (mot de passe oublié) : SMTP si SMTP_HOST est défini (ex. Brevo), sinon affichage en console.
const useSmtp = Boolean(process.env.SMTP_HOST)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · PCRF' },
    dateFormat: 'dd/MM/yyyy HH:mm',
  },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: 'fr' },
  collections: [Articles, Media, Rubriques, Pages, Users],
  globals: [Site, Navigation, Accueil],
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      LinkFeature({ enabledCollections: ['articles', 'pages', 'rubriques'] }),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
      UploadFeature({ collections: { media: { fields: [{ name: 'caption', type: 'text', label: 'Légende' }] } } }),
      HorizontalRuleFeature(),
      FixedToolbarFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  graphQL: { disable: true },
  ...(useSmtp
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM || 'site@pcrf-ic.fr',
          defaultFromName: 'Site du PCRF',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
        }),
      }
    : {}),
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: { media: { prefix: 'media' } },
            bucket: process.env.S3_BUCKET || '',
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'auto',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
  ],
})
