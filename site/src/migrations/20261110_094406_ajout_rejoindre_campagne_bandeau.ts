import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ADD COLUMN "external_url" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_external_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filename" varchar;
  ALTER TABLE "site" ADD COLUMN "join_email" varchar;
  CREATE INDEX "media_sizes_banner_sizes_banner_filename_idx" ON "media" USING btree ("sizes_banner_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_banner_sizes_banner_filename_idx";
  ALTER TABLE "articles" DROP COLUMN "external_url";
  ALTER TABLE "_articles_v" DROP COLUMN "version_external_url";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_url";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_width";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_height";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filename";
  ALTER TABLE "site" DROP COLUMN "join_email";`)
}
