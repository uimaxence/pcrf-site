import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "legacy_spip_id" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_legacy_spip_id" numeric;
  ALTER TABLE "navigation_footer_columns" ADD COLUMN "two_columns" boolean DEFAULT false;
  CREATE INDEX "pages_legacy_legacy_spip_id_idx" ON "pages" USING btree ("legacy_spip_id");
  CREATE INDEX "_pages_v_version_legacy_version_legacy_spip_id_idx" ON "_pages_v" USING btree ("version_legacy_spip_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pages_legacy_legacy_spip_id_idx";
  DROP INDEX "_pages_v_version_legacy_version_legacy_spip_id_idx";
  ALTER TABLE "pages" DROP COLUMN "legacy_spip_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_legacy_spip_id";
  ALTER TABLE "navigation_footer_columns" DROP COLUMN "two_columns";`)
}
