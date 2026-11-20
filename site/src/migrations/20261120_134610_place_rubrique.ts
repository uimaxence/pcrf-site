import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_placement" AS ENUM('debut', 'date', 'fin');
  CREATE TYPE "public"."enum__articles_v_version_placement" AS ENUM('debut', 'date', 'fin');
  ALTER TABLE "articles" ADD COLUMN "placement" "enum_articles_placement" DEFAULT 'date';
  ALTER TABLE "_articles_v" ADD COLUMN "version_placement" "enum__articles_v_version_placement" DEFAULT 'date';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP COLUMN "placement";
  ALTER TABLE "_articles_v" DROP COLUMN "version_placement";
  DROP TYPE "public"."enum_articles_placement";
  DROP TYPE "public"."enum__articles_v_version_placement";`)
}
