import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accueil" ADD COLUMN "featured_interval" numeric DEFAULT 7;
  ALTER TABLE "accueil_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "accueil_rels" ADD CONSTRAINT "accueil_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accueil_rels_articles_id_idx" ON "accueil_rels" USING btree ("articles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accueil_rels" DROP CONSTRAINT "accueil_rels_articles_fk";
  
  DROP INDEX "accueil_rels_articles_id_idx";
  ALTER TABLE "accueil" DROP COLUMN "featured_interval";
  ALTER TABLE "accueil_rels" DROP COLUMN "articles_id";`)
}
