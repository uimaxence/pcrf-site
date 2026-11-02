import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('redacteur', 'admin');
  CREATE TYPE "public"."enum_navigation_primary_type" AS ENUM('rubrique', 'page', 'article', 'url');
  CREATE TYPE "public"."enum_navigation_secondary_type" AS ENUM('rubrique', 'page', 'article', 'url');
  CREATE TYPE "public"."enum_navigation_footer_columns_links_type" AS ENUM('rubrique', 'page', 'article', 'url');
  CREATE TABLE "articles_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"chapo" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"video_url" varchar,
  	"rubrique_id" integer,
  	"date" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"auteur" varchar,
  	"slug" varchar,
  	"legacy_html" varchar,
  	"legacy_spip_url" varchar,
  	"legacy_spip_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articles_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_chapo" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_video_url" varchar,
  	"version_rubrique_id" integer,
  	"version_date" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_auteur" varchar,
  	"version_slug" varchar,
  	"version_legacy_html" varchar,
  	"version_legacy_spip_url" varchar,
  	"version_legacy_spip_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "rubriques" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"parent_id" integer,
  	"order" numeric DEFAULT 100,
  	"description" varchar,
  	"spip_id" numeric,
  	"legacy_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"slug" varchar,
  	"legacy_html" varchar,
  	"legacy_spip_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"version_legacy_html" varchar,
  	"version_legacy_spip_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'redacteur' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"media_id" integer,
  	"rubriques_id" integer,
  	"pages_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Parti Communiste Révolutionnaire de France' NOT NULL,
  	"short_name" varchar DEFAULT 'PCRF',
  	"slogan" varchar DEFAULT 'Prolétaires de tous les pays, unissez-vous !',
  	"description" varchar DEFAULT 'Site du Parti Communiste Révolutionnaire de France : analyses, luttes, actualité du mouvement communiste en France et dans le monde.',
  	"logo_id" integer,
  	"banner_enabled" boolean DEFAULT true,
  	"banner_image_id" integer,
  	"facebook" varchar,
  	"instagram" varchar,
  	"youtube" varchar DEFAULT 'https://www.youtube.com/channel/UCoyBtYYDy0MuqfR_P_-CVYQ',
  	"contact_email" varchar DEFAULT 'ic.pcrf@gmail.com',
  	"postal_address" varchar DEFAULT 'Amis d’Oulianov, BP 40064, 75862 Paris CEDEX 18',
  	"newsletter_title" varchar DEFAULT 'Recevez nos analyses et nos rendez-vous',
  	"newsletter_text" varchar DEFAULT 'Une à deux fois par semaine, nos articles et appels dans votre boîte mail. Désinscription en un clic.',
  	"brevo_form_url" varchar,
  	"helloasso_url" varchar,
  	"don_text" varchar DEFAULT 'Le PCRF ne vit que des cotisations et des dons de ses membres et sympathisants. Les dons ouvrent droit à une réduction d’impôt de 66 %.',
  	"journal_name" varchar DEFAULT 'Intervention Communiste',
  	"journal_subscribe_text" varchar DEFAULT '20 € pour 1 an, 10 € étudiants et privés d’emploi, 9 € e-abonnement, soutien à partir de 30 €. Chèque à l’ordre de « Mandataire PCRF ».',
  	"journal_subscribe_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_primary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_primary_type" DEFAULT 'rubrique' NOT NULL,
  	"rubrique_id" integer,
  	"page_id" integer,
  	"article_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_secondary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_secondary_type" DEFAULT 'rubrique' NOT NULL,
  	"rubrique_id" integer,
  	"page_id" integer,
  	"article_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_columns_links_type" DEFAULT 'rubrique' NOT NULL,
  	"rubrique_id" integer,
  	"page_id" integer,
  	"article_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "accueil" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"programme_title" varchar DEFAULT 'Le programme du PCRF',
  	"programme_text" varchar DEFAULT 'Le socialisme-communisme : seule alternative au capitalisme ! Adopté au 1er congrès.',
  	"programme_cover_id" integer,
  	"programme_pdf_id" integer,
  	"programme_page_id" integer,
  	"video_title" varchar DEFAULT 'Dernière vidéo',
  	"video_article_id" integer,
  	"journal_title" varchar DEFAULT 'Intervention Communiste',
  	"journal_article_id" integer,
  	"featured_count" numeric DEFAULT 3,
  	"latest_count" numeric DEFAULT 6,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "accueil_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"rubriques_id" integer
  );
  
  ALTER TABLE "articles_documents" ADD CONSTRAINT "articles_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_documents" ADD CONSTRAINT "articles_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_rubrique_id_rubriques_id_fk" FOREIGN KEY ("rubrique_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_version_documents" ADD CONSTRAINT "_articles_v_version_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_version_documents" ADD CONSTRAINT "_articles_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_rubrique_id_rubriques_id_fk" FOREIGN KEY ("version_rubrique_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rubriques" ADD CONSTRAINT "rubriques_parent_id_rubriques_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rubriques_fk" FOREIGN KEY ("rubriques_id") REFERENCES "public"."rubriques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_rubrique_id_rubriques_id_fk" FOREIGN KEY ("rubrique_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_rubrique_id_rubriques_id_fk" FOREIGN KEY ("rubrique_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_rubrique_id_rubriques_id_fk" FOREIGN KEY ("rubrique_id") REFERENCES "public"."rubriques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accueil" ADD CONSTRAINT "accueil_programme_cover_id_media_id_fk" FOREIGN KEY ("programme_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil" ADD CONSTRAINT "accueil_programme_pdf_id_media_id_fk" FOREIGN KEY ("programme_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil" ADD CONSTRAINT "accueil_programme_page_id_pages_id_fk" FOREIGN KEY ("programme_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil" ADD CONSTRAINT "accueil_video_article_id_articles_id_fk" FOREIGN KEY ("video_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil" ADD CONSTRAINT "accueil_journal_article_id_articles_id_fk" FOREIGN KEY ("journal_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accueil_rels" ADD CONSTRAINT "accueil_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."accueil"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accueil_rels" ADD CONSTRAINT "accueil_rels_rubriques_fk" FOREIGN KEY ("rubriques_id") REFERENCES "public"."rubriques"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_documents_order_idx" ON "articles_documents" USING btree ("_order");
  CREATE INDEX "articles_documents_parent_id_idx" ON "articles_documents" USING btree ("_parent_id");
  CREATE INDEX "articles_documents_file_idx" ON "articles_documents" USING btree ("file_id");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_rubrique_idx" ON "articles" USING btree ("rubrique_id");
  CREATE INDEX "articles_date_idx" ON "articles" USING btree ("date");
  CREATE INDEX "articles_featured_idx" ON "articles" USING btree ("featured");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_legacy_legacy_spip_id_idx" ON "articles" USING btree ("legacy_spip_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_version_documents_order_idx" ON "_articles_v_version_documents" USING btree ("_order");
  CREATE INDEX "_articles_v_version_documents_parent_id_idx" ON "_articles_v_version_documents" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_documents_file_idx" ON "_articles_v_version_documents" USING btree ("file_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_rubrique_idx" ON "_articles_v" USING btree ("version_rubrique_id");
  CREATE INDEX "_articles_v_version_version_date_idx" ON "_articles_v" USING btree ("version_date");
  CREATE INDEX "_articles_v_version_version_featured_idx" ON "_articles_v" USING btree ("version_featured");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_legacy_version_legacy_spip_id_idx" ON "_articles_v" USING btree ("version_legacy_spip_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "rubriques_slug_idx" ON "rubriques" USING btree ("slug");
  CREATE INDEX "rubriques_parent_idx" ON "rubriques" USING btree ("parent_id");
  CREATE INDEX "rubriques_spip_id_idx" ON "rubriques" USING btree ("spip_id");
  CREATE INDEX "rubriques_legacy_slug_idx" ON "rubriques" USING btree ("legacy_slug");
  CREATE INDEX "rubriques_updated_at_idx" ON "rubriques" USING btree ("updated_at");
  CREATE INDEX "rubriques_created_at_idx" ON "rubriques" USING btree ("created_at");
  CREATE INDEX "pages_cover_idx" ON "pages" USING btree ("cover_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_cover_idx" ON "_pages_v" USING btree ("version_cover_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_rubriques_id_idx" ON "payload_locked_documents_rels" USING btree ("rubriques_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_logo_idx" ON "site" USING btree ("logo_id");
  CREATE INDEX "site_banner_image_idx" ON "site" USING btree ("banner_image_id");
  CREATE INDEX "navigation_primary_order_idx" ON "navigation_primary" USING btree ("_order");
  CREATE INDEX "navigation_primary_parent_id_idx" ON "navigation_primary" USING btree ("_parent_id");
  CREATE INDEX "navigation_primary_rubrique_idx" ON "navigation_primary" USING btree ("rubrique_id");
  CREATE INDEX "navigation_primary_page_idx" ON "navigation_primary" USING btree ("page_id");
  CREATE INDEX "navigation_primary_article_idx" ON "navigation_primary" USING btree ("article_id");
  CREATE INDEX "navigation_secondary_order_idx" ON "navigation_secondary" USING btree ("_order");
  CREATE INDEX "navigation_secondary_parent_id_idx" ON "navigation_secondary" USING btree ("_parent_id");
  CREATE INDEX "navigation_secondary_rubrique_idx" ON "navigation_secondary" USING btree ("rubrique_id");
  CREATE INDEX "navigation_secondary_page_idx" ON "navigation_secondary" USING btree ("page_id");
  CREATE INDEX "navigation_secondary_article_idx" ON "navigation_secondary" USING btree ("article_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_rubrique_idx" ON "navigation_footer_columns_links" USING btree ("rubrique_id");
  CREATE INDEX "navigation_footer_columns_links_page_idx" ON "navigation_footer_columns_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_links_article_idx" ON "navigation_footer_columns_links" USING btree ("article_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "accueil_programme_cover_idx" ON "accueil" USING btree ("programme_cover_id");
  CREATE INDEX "accueil_programme_pdf_idx" ON "accueil" USING btree ("programme_pdf_id");
  CREATE INDEX "accueil_programme_page_idx" ON "accueil" USING btree ("programme_page_id");
  CREATE INDEX "accueil_video_article_idx" ON "accueil" USING btree ("video_article_id");
  CREATE INDEX "accueil_journal_article_idx" ON "accueil" USING btree ("journal_article_id");
  CREATE INDEX "accueil_rels_order_idx" ON "accueil_rels" USING btree ("order");
  CREATE INDEX "accueil_rels_parent_idx" ON "accueil_rels" USING btree ("parent_id");
  CREATE INDEX "accueil_rels_path_idx" ON "accueil_rels" USING btree ("path");
  CREATE INDEX "accueil_rels_rubriques_id_idx" ON "accueil_rels" USING btree ("rubriques_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articles_documents" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v_version_documents" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "rubriques" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site" CASCADE;
  DROP TABLE "navigation_primary" CASCADE;
  DROP TABLE "navigation_secondary" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "accueil" CASCADE;
  DROP TABLE "accueil_rels" CASCADE;
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_navigation_primary_type";
  DROP TYPE "public"."enum_navigation_secondary_type";
  DROP TYPE "public"."enum_navigation_footer_columns_links_type";`)
}
