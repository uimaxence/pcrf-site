import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "accueil_programme_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  ALTER TABLE "accueil" ALTER COLUMN "featured_count" SET DEFAULT 5;
  ALTER TABLE "accueil_programme_pages" ADD CONSTRAINT "accueil_programme_pages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil_programme_pages" ADD CONSTRAINT "accueil_programme_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accueil"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accueil_programme_pages_order_idx" ON "accueil_programme_pages" USING btree ("_order");
  CREATE INDEX "accueil_programme_pages_parent_id_idx" ON "accueil_programme_pages" USING btree ("_parent_id");
  CREATE INDEX "accueil_programme_pages_image_idx" ON "accueil_programme_pages" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accueil_programme_pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "accueil_programme_pages" CASCADE;
  ALTER TABLE "accueil" ALTER COLUMN "featured_count" SET DEFAULT 3;`)
}
