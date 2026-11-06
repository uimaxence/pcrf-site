import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" ALTER COLUMN "newsletter_text" SET DEFAULT 'Deux fois par mois, nos articles et appels dans votre boîte mail. Désinscription en un clic.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" ALTER COLUMN "newsletter_text" SET DEFAULT 'Une à deux fois par semaine, nos articles et appels dans votre boîte mail. Désinscription en un clic.';`)
}
