import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ADD COLUMN "congres" boolean DEFAULT false;
  ALTER TABLE "_articles_v" ADD COLUMN "version_congres" boolean DEFAULT false;
  CREATE INDEX "articles_congres_idx" ON "articles" USING btree ("congres");
  CREATE INDEX "_articles_v_version_version_congres_idx" ON "_articles_v" USING btree ("version_congres");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "articles_congres_idx";
  DROP INDEX "_articles_v_version_version_congres_idx";
  ALTER TABLE "articles" DROP COLUMN "congres";
  ALTER TABLE "_articles_v" DROP COLUMN "version_congres";`)
}
