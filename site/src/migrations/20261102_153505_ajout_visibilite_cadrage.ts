import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_cover_position" AS ENUM('center', 'top', 'bottom', 'left', 'right');
  CREATE TYPE "public"."enum__articles_v_version_cover_position" AS ENUM('center', 'top', 'bottom', 'left', 'right');
  ALTER TABLE "articles" ADD COLUMN "cover_position" "enum_articles_cover_position" DEFAULT 'center';
  ALTER TABLE "articles" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_articles_v" ADD COLUMN "version_cover_position" "enum__articles_v_version_cover_position" DEFAULT 'center';
  ALTER TABLE "_articles_v" ADD COLUMN "version_visible" boolean DEFAULT true;
  CREATE INDEX "articles_visible_idx" ON "articles" USING btree ("visible");
  CREATE INDEX "_articles_v_version_version_visible_idx" ON "_articles_v" USING btree ("version_visible");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "articles_visible_idx";
  DROP INDEX "_articles_v_version_version_visible_idx";
  ALTER TABLE "articles" DROP COLUMN "cover_position";
  ALTER TABLE "articles" DROP COLUMN "visible";
  ALTER TABLE "_articles_v" DROP COLUMN "version_cover_position";
  ALTER TABLE "_articles_v" DROP COLUMN "version_visible";
  DROP TYPE "public"."enum_articles_cover_position";
  DROP TYPE "public"."enum__articles_v_version_cover_position";`)
}
