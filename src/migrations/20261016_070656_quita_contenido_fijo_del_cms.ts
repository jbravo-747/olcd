import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_proyectos_lab" AS ENUM('data-lab', 'citizen-science-lab', 'methods-lab', 'narratives-lab', 'policy-lab');
  CREATE TYPE "public"."enum_publicaciones_lab" AS ENUM('data-lab', 'citizen-science-lab', 'methods-lab', 'narratives-lab', 'policy-lab');
  -- Datos que hay que rescatar antes de borrar labs y organizaciones.
  ALTER TABLE "proyectos" ADD COLUMN "lab" "enum_proyectos_lab";
  ALTER TABLE "publicaciones" ADD COLUMN "lab" "enum_publicaciones_lab";
  ALTER TABLE "personas_locales" ADD COLUMN "organizacion" varchar;
  UPDATE "proyectos" p SET "lab" = l."slug"::text::"enum_proyectos_lab"
    FROM "labs" l
    WHERE p."lab_id" = l."id"
      AND l."slug" IN ('data-lab', 'citizen-science-lab', 'methods-lab', 'narratives-lab', 'policy-lab');
  UPDATE "publicaciones" p SET "lab" = l."slug"::text::"enum_publicaciones_lab"
    FROM "labs" l
    WHERE p."lab_id" = l."id"
      AND l."slug" IN ('data-lab', 'citizen-science-lab', 'methods-lab', 'narratives-lab', 'policy-lab');
  UPDATE "personas_locales" pl SET "organizacion" = o."nombre"
    FROM "personas" p JOIN "organizaciones" o ON o."id" = p."organizacion_id"
    WHERE pl."_parent_id" = p."id";
  -- El equipo ahora vive en el código (src/contenido/equipo.ts).
  DELETE FROM "personas" WHERE "equipo" = true;
  -- Proyectos de un lab que ya no existe: no tendrían URL.
  DELETE FROM "proyectos" WHERE "lab" IS NULL;
  ALTER TABLE "proyectos" ALTER COLUMN "lab" SET NOT NULL;
  ALTER TABLE "labs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "labs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "centros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "organizaciones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "organizaciones_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sitio_redes_enlaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sitio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sitio_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "labs" CASCADE;
  DROP TABLE "labs_locales" CASCADE;
  DROP TABLE "centros" CASCADE;
  DROP TABLE "organizaciones" CASCADE;
  DROP TABLE "organizaciones_locales" CASCADE;
  DROP TABLE "sitio_redes_enlaces" CASCADE;
  DROP TABLE "sitio" CASCADE;
  DROP TABLE "sitio_locales" CASCADE;
  ALTER TABLE "proyectos" DROP CONSTRAINT IF EXISTS "proyectos_lab_id_labs_id_fk";
  
  ALTER TABLE "publicaciones" DROP CONSTRAINT IF EXISTS "publicaciones_lab_id_labs_id_fk";
  
  ALTER TABLE "personas" DROP CONSTRAINT IF EXISTS "personas_organizacion_id_organizaciones_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_labs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_centros_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_organizaciones_fk";
  
  DROP INDEX IF EXISTS "publicaciones_lab_idx";
  DROP INDEX IF EXISTS "personas_organizacion_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_labs_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_centros_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_organizaciones_id_idx";
  DROP INDEX IF EXISTS "proyectos_lab_idx";
  CREATE INDEX "proyectos_lab_idx" ON "proyectos" USING btree ("lab");
  ALTER TABLE "proyectos" DROP COLUMN "lab_id";
  ALTER TABLE "publicaciones" DROP COLUMN "lab_id";
  ALTER TABLE "personas" DROP COLUMN "equipo";
  ALTER TABLE "personas" DROP COLUMN "organizacion_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "labs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "centros_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "organizaciones_id";
  DROP TYPE "public"."enum_centros_estado";
  DROP TYPE "public"."enum_sitio_redes_enlaces_red";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_centros_estado" AS ENUM('en-operacion', 'en-construccion', 'anunciado');
  CREATE TYPE "public"."enum_sitio_redes_enlaces_red" AS ENUM('instagram', 'linkedin', 'facebook');
  CREATE TABLE "labs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"orden" numeric DEFAULT 0,
  	"imagen_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "labs_locales" (
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"introduccion" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "centros" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"ciudad" varchar NOT NULL,
  	"pais" varchar NOT NULL,
  	"empresa" varchar,
  	"estado" "enum_centros_estado" NOT NULL,
  	"inversion_usd_millones" numeric,
  	"lat" numeric NOT NULL,
  	"lng" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organizaciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"region" varchar,
  	"web" varchar,
  	"correo" varchar,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organizaciones_locales" (
  	"descripcion" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sitio_redes_enlaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"red" "enum_sitio_redes_enlaces_red" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "sitio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"redes_correo_contacto" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "sitio_locales" (
  	"inicio_texto" varchar,
  	"quienes_somos_titulo" varchar,
  	"quienes_somos_proposito" jsonb,
  	"quienes_somos_equipo_texto" varchar,
  	"quienes_somos_organizaciones_texto" varchar,
  	"quienes_somos_personas_texto" varchar,
  	"paginas_ejes_de_trabajo" varchar,
  	"paginas_mapa" varchar,
  	"paginas_mapa_resumen" varchar,
  	"paginas_contacto" varchar,
  	"publicaciones_reportes" varchar,
  	"publicaciones_articulos_libros" varchar,
  	"publicaciones_recursos_educativos" varchar,
  	"actualidad_blog" varchar,
  	"actualidad_comunicados" varchar,
  	"actualidad_cobertura_prensa" varchar,
  	"actualidad_noticias_observatorio" varchar,
  	"legales_accesibilidad" jsonb,
  	"legales_privacidad" jsonb,
  	"legales_terminos" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "proyectos_lab_idx";
  ALTER TABLE "proyectos" ADD COLUMN "lab_id" integer NOT NULL;
  ALTER TABLE "publicaciones" ADD COLUMN "lab_id" integer;
  ALTER TABLE "personas" ADD COLUMN "equipo" boolean DEFAULT false;
  ALTER TABLE "personas" ADD COLUMN "organizacion_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "labs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "centros_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "organizaciones_id" integer;
  ALTER TABLE "labs" ADD CONSTRAINT "labs_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "labs_locales" ADD CONSTRAINT "labs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizaciones" ADD CONSTRAINT "organizaciones_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizaciones_locales" ADD CONSTRAINT "organizaciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio_redes_enlaces" ADD CONSTRAINT "sitio_redes_enlaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sitio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio_locales" ADD CONSTRAINT "sitio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sitio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "labs_slug_idx" ON "labs" USING btree ("slug");
  CREATE INDEX "labs_imagen_idx" ON "labs" USING btree ("imagen_id");
  CREATE INDEX "labs_updated_at_idx" ON "labs" USING btree ("updated_at");
  CREATE INDEX "labs_created_at_idx" ON "labs" USING btree ("created_at");
  CREATE UNIQUE INDEX "labs_locales_locale_parent_id_unique" ON "labs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "centros_pais_idx" ON "centros" USING btree ("pais");
  CREATE INDEX "centros_estado_idx" ON "centros" USING btree ("estado");
  CREATE INDEX "centros_updated_at_idx" ON "centros" USING btree ("updated_at");
  CREATE INDEX "centros_created_at_idx" ON "centros" USING btree ("created_at");
  CREATE UNIQUE INDEX "organizaciones_slug_idx" ON "organizaciones" USING btree ("slug");
  CREATE INDEX "organizaciones_logo_idx" ON "organizaciones" USING btree ("logo_id");
  CREATE INDEX "organizaciones_updated_at_idx" ON "organizaciones" USING btree ("updated_at");
  CREATE INDEX "organizaciones_created_at_idx" ON "organizaciones" USING btree ("created_at");
  CREATE UNIQUE INDEX "organizaciones_locales_locale_parent_id_unique" ON "organizaciones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sitio_redes_enlaces_order_idx" ON "sitio_redes_enlaces" USING btree ("_order");
  CREATE INDEX "sitio_redes_enlaces_parent_id_idx" ON "sitio_redes_enlaces" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sitio_locales_locale_parent_id_unique" ON "sitio_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "personas" ADD CONSTRAINT "personas_organizacion_id_organizaciones_id_fk" FOREIGN KEY ("organizacion_id") REFERENCES "public"."organizaciones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_labs_fk" FOREIGN KEY ("labs_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_centros_fk" FOREIGN KEY ("centros_id") REFERENCES "public"."centros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizaciones_fk" FOREIGN KEY ("organizaciones_id") REFERENCES "public"."organizaciones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "publicaciones_lab_idx" ON "publicaciones" USING btree ("lab_id");
  CREATE INDEX "personas_organizacion_idx" ON "personas" USING btree ("organizacion_id");
  CREATE INDEX "payload_locked_documents_rels_labs_id_idx" ON "payload_locked_documents_rels" USING btree ("labs_id");
  CREATE INDEX "payload_locked_documents_rels_centros_id_idx" ON "payload_locked_documents_rels" USING btree ("centros_id");
  CREATE INDEX "payload_locked_documents_rels_organizaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("organizaciones_id");
  CREATE INDEX "proyectos_lab_idx" ON "proyectos" USING btree ("lab_id");
  ALTER TABLE "proyectos" DROP COLUMN "lab";
  ALTER TABLE "publicaciones" DROP COLUMN "lab";
  ALTER TABLE "personas_locales" DROP COLUMN "organizacion";
  DROP TYPE "public"."enum_proyectos_lab";
  DROP TYPE "public"."enum_publicaciones_lab";`)
}
