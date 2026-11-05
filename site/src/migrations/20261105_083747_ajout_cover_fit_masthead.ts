import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_cover_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__articles_v_version_cover_fit" AS ENUM('cover', 'contain');
  CREATE TABLE "site_masthead_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  ALTER TABLE "accueil" ALTER COLUMN "featured_count" SET DEFAULT 4;
  ALTER TABLE "articles" ADD COLUMN "cover_fit" "enum_articles_cover_fit" DEFAULT 'cover';
  ALTER TABLE "_articles_v" ADD COLUMN "version_cover_fit" "enum__articles_v_version_cover_fit" DEFAULT 'cover';
  ALTER TABLE "site_masthead_images" ADD CONSTRAINT "site_masthead_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_masthead_images" ADD CONSTRAINT "site_masthead_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_masthead_images_order_idx" ON "site_masthead_images" USING btree ("_order");
  CREATE INDEX "site_masthead_images_parent_id_idx" ON "site_masthead_images" USING btree ("_parent_id");
  CREATE INDEX "site_masthead_images_image_idx" ON "site_masthead_images" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_masthead_images" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_masthead_images" CASCADE;
  ALTER TABLE "accueil" ALTER COLUMN "featured_count" SET DEFAULT 5;
  ALTER TABLE "articles" DROP COLUMN "cover_fit";
  ALTER TABLE "_articles_v" DROP COLUMN "version_cover_fit";
  DROP TYPE "public"."enum_articles_cover_fit";
  DROP TYPE "public"."enum__articles_v_version_cover_fit";`)
}
