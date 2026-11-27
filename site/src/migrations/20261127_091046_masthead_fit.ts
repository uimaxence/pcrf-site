import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_masthead_images_fit" AS ENUM('auto', 'cover', 'contain');
  ALTER TABLE "site_masthead_images" ADD COLUMN "fit" "enum_site_masthead_images_fit" DEFAULT 'auto';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_masthead_images" DROP COLUMN "fit";
  DROP TYPE "public"."enum_site_masthead_images_fit";`)
}
