import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_publicaciones_tipo" AS ENUM('reportes', 'articulos-y-libros', 'recursos-educativos');
  CREATE TYPE "public"."enum_entradas_tipo" AS ENUM('blog', 'comunicados', 'cobertura-de-prensa', 'noticias-del-observatorio');
  CREATE TYPE "public"."enum_centros_estado" AS ENUM('en-operacion', 'en-construccion', 'anunciado');
  CREATE TYPE "public"."enum_personas_grupo" AS ENUM('investigacion', 'comunidad', 'aliados');
  CREATE TYPE "public"."enum_users_rol" AS ENUM('admin', 'editor');
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
  
  CREATE TABLE "proyectos_secciones_subsecciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "proyectos_secciones_subsecciones_locales" (
  	"titulo" varchar NOT NULL,
  	"cuerpo" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "proyectos_secciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "proyectos_secciones_locales" (
  	"titulo" varchar NOT NULL,
  	"cuerpo" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "proyectos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"lab_id" integer NOT NULL,
  	"autores" varchar,
  	"anio" varchar,
  	"descargable_archivo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "proyectos_locales" (
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"lugar" varchar,
  	"participantes" varchar,
  	"descargable_etiqueta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "proyectos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "publicaciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"tipo" "enum_publicaciones_tipo" NOT NULL,
  	"lab_id" integer,
  	"autores" varchar,
  	"anio" varchar,
  	"paginas" varchar,
  	"portada_id" integer,
  	"pdf_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "publicaciones_locales" (
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"contenido" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "publicaciones_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer
  );
  
  CREATE TABLE "entradas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"tipo" "enum_entradas_tipo" NOT NULL,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"creditos" varchar,
  	"fuente" varchar,
  	"pdf_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entradas_locales" (
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"contenido" jsonb,
  	"participantes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "entradas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "noticias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"medio" varchar NOT NULL,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "noticias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer
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
  
  CREATE TABLE "personas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"orden" numeric DEFAULT 0,
  	"equipo" boolean DEFAULT false,
  	"grupo" "enum_personas_grupo" NOT NULL,
  	"organizacion_id" integer,
  	"region" varchar,
  	"correo" varchar,
  	"foto_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "personas_locales" (
  	"titulo" varchar,
  	"rol" varchar,
  	"afiliacion" varchar,
  	"biografia" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credito" varchar,
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
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documentos" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "documentos_locales" (
  	"titulo" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "mensajes_contacto" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"correo" varchar NOT NULL,
  	"asunto" varchar NOT NULL,
  	"mensaje" varchar NOT NULL,
  	"leido" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"nombre" varchar NOT NULL,
  	"rol" "enum_users_rol" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
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
  	"labs_id" integer,
  	"proyectos_id" integer,
  	"publicaciones_id" integer,
  	"entradas_id" integer,
  	"noticias_id" integer,
  	"centros_id" integer,
  	"personas_id" integer,
  	"organizaciones_id" integer,
  	"categorias_id" integer,
  	"media_id" integer,
  	"documentos_id" integer,
  	"mensajes_contacto_id" integer,
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
  	"inicio_titulo" varchar NOT NULL,
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
  
  ALTER TABLE "labs" ADD CONSTRAINT "labs_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "labs_locales" ADD CONSTRAINT "labs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_secciones_subsecciones" ADD CONSTRAINT "proyectos_secciones_subsecciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos_secciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_secciones_subsecciones_locales" ADD CONSTRAINT "proyectos_secciones_subsecciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos_secciones_subsecciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_secciones" ADD CONSTRAINT "proyectos_secciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_secciones_locales" ADD CONSTRAINT "proyectos_secciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos_secciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_descargable_archivo_id_documentos_id_fk" FOREIGN KEY ("descargable_archivo_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "proyectos_locales" ADD CONSTRAINT "proyectos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proyectos_rels" ADD CONSTRAINT "proyectos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_pdf_id_documentos_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publicaciones_locales" ADD CONSTRAINT "publicaciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones_rels" ADD CONSTRAINT "publicaciones_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publicaciones_rels" ADD CONSTRAINT "publicaciones_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas" ADD CONSTRAINT "entradas_pdf_id_documentos_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entradas_locales" ADD CONSTRAINT "entradas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entradas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_rels" ADD CONSTRAINT "entradas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."entradas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_rels" ADD CONSTRAINT "entradas_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_rels" ADD CONSTRAINT "entradas_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas" ADD CONSTRAINT "personas_organizacion_id_organizaciones_id_fk" FOREIGN KEY ("organizacion_id") REFERENCES "public"."organizaciones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "personas" ADD CONSTRAINT "personas_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "personas_locales" ADD CONSTRAINT "personas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizaciones" ADD CONSTRAINT "organizaciones_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizaciones_locales" ADD CONSTRAINT "organizaciones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_locales" ADD CONSTRAINT "categorias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documentos_locales" ADD CONSTRAINT "documentos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_labs_fk" FOREIGN KEY ("labs_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyectos_fk" FOREIGN KEY ("proyectos_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publicaciones_fk" FOREIGN KEY ("publicaciones_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entradas_fk" FOREIGN KEY ("entradas_id") REFERENCES "public"."entradas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_centros_fk" FOREIGN KEY ("centros_id") REFERENCES "public"."centros"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizaciones_fk" FOREIGN KEY ("organizaciones_id") REFERENCES "public"."organizaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mensajes_contacto_fk" FOREIGN KEY ("mensajes_contacto_id") REFERENCES "public"."mensajes_contacto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio_redes_enlaces" ADD CONSTRAINT "sitio_redes_enlaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sitio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio_locales" ADD CONSTRAINT "sitio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sitio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "labs_slug_idx" ON "labs" USING btree ("slug");
  CREATE INDEX "labs_imagen_idx" ON "labs" USING btree ("imagen_id");
  CREATE INDEX "labs_updated_at_idx" ON "labs" USING btree ("updated_at");
  CREATE INDEX "labs_created_at_idx" ON "labs" USING btree ("created_at");
  CREATE UNIQUE INDEX "labs_locales_locale_parent_id_unique" ON "labs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyectos_secciones_subsecciones_order_idx" ON "proyectos_secciones_subsecciones" USING btree ("_order");
  CREATE INDEX "proyectos_secciones_subsecciones_parent_id_idx" ON "proyectos_secciones_subsecciones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "proyectos_secciones_subsecciones_locales_locale_parent_id_un" ON "proyectos_secciones_subsecciones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyectos_secciones_order_idx" ON "proyectos_secciones" USING btree ("_order");
  CREATE INDEX "proyectos_secciones_parent_id_idx" ON "proyectos_secciones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "proyectos_secciones_locales_locale_parent_id_unique" ON "proyectos_secciones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyectos_slug_idx" ON "proyectos" USING btree ("slug");
  CREATE INDEX "proyectos_lab_idx" ON "proyectos" USING btree ("lab_id");
  CREATE INDEX "proyectos_descargable_descargable_archivo_idx" ON "proyectos" USING btree ("descargable_archivo_id");
  CREATE INDEX "proyectos_updated_at_idx" ON "proyectos" USING btree ("updated_at");
  CREATE INDEX "proyectos_created_at_idx" ON "proyectos" USING btree ("created_at");
  CREATE UNIQUE INDEX "proyectos_locales_locale_parent_id_unique" ON "proyectos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyectos_rels_order_idx" ON "proyectos_rels" USING btree ("order");
  CREATE INDEX "proyectos_rels_parent_idx" ON "proyectos_rels" USING btree ("parent_id");
  CREATE INDEX "proyectos_rels_path_idx" ON "proyectos_rels" USING btree ("path");
  CREATE INDEX "proyectos_rels_categorias_id_idx" ON "proyectos_rels" USING btree ("categorias_id");
  CREATE INDEX "proyectos_rels_media_id_idx" ON "proyectos_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "publicaciones_slug_idx" ON "publicaciones" USING btree ("slug");
  CREATE INDEX "publicaciones_tipo_idx" ON "publicaciones" USING btree ("tipo");
  CREATE INDEX "publicaciones_lab_idx" ON "publicaciones" USING btree ("lab_id");
  CREATE INDEX "publicaciones_portada_idx" ON "publicaciones" USING btree ("portada_id");
  CREATE INDEX "publicaciones_pdf_idx" ON "publicaciones" USING btree ("pdf_id");
  CREATE INDEX "publicaciones_updated_at_idx" ON "publicaciones" USING btree ("updated_at");
  CREATE INDEX "publicaciones_created_at_idx" ON "publicaciones" USING btree ("created_at");
  CREATE UNIQUE INDEX "publicaciones_locales_locale_parent_id_unique" ON "publicaciones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "publicaciones_rels_order_idx" ON "publicaciones_rels" USING btree ("order");
  CREATE INDEX "publicaciones_rels_parent_idx" ON "publicaciones_rels" USING btree ("parent_id");
  CREATE INDEX "publicaciones_rels_path_idx" ON "publicaciones_rels" USING btree ("path");
  CREATE INDEX "publicaciones_rels_categorias_id_idx" ON "publicaciones_rels" USING btree ("categorias_id");
  CREATE UNIQUE INDEX "entradas_slug_idx" ON "entradas" USING btree ("slug");
  CREATE INDEX "entradas_tipo_idx" ON "entradas" USING btree ("tipo");
  CREATE INDEX "entradas_fecha_idx" ON "entradas" USING btree ("fecha");
  CREATE INDEX "entradas_pdf_idx" ON "entradas" USING btree ("pdf_id");
  CREATE INDEX "entradas_updated_at_idx" ON "entradas" USING btree ("updated_at");
  CREATE INDEX "entradas_created_at_idx" ON "entradas" USING btree ("created_at");
  CREATE UNIQUE INDEX "entradas_locales_locale_parent_id_unique" ON "entradas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "entradas_rels_order_idx" ON "entradas_rels" USING btree ("order");
  CREATE INDEX "entradas_rels_parent_idx" ON "entradas_rels" USING btree ("parent_id");
  CREATE INDEX "entradas_rels_path_idx" ON "entradas_rels" USING btree ("path");
  CREATE INDEX "entradas_rels_categorias_id_idx" ON "entradas_rels" USING btree ("categorias_id");
  CREATE INDEX "entradas_rels_media_id_idx" ON "entradas_rels" USING btree ("media_id");
  CREATE INDEX "noticias_medio_idx" ON "noticias" USING btree ("medio");
  CREATE INDEX "noticias_fecha_idx" ON "noticias" USING btree ("fecha");
  CREATE INDEX "noticias_updated_at_idx" ON "noticias" USING btree ("updated_at");
  CREATE INDEX "noticias_created_at_idx" ON "noticias" USING btree ("created_at");
  CREATE INDEX "noticias_rels_order_idx" ON "noticias_rels" USING btree ("order");
  CREATE INDEX "noticias_rels_parent_idx" ON "noticias_rels" USING btree ("parent_id");
  CREATE INDEX "noticias_rels_path_idx" ON "noticias_rels" USING btree ("path");
  CREATE INDEX "noticias_rels_categorias_id_idx" ON "noticias_rels" USING btree ("categorias_id");
  CREATE INDEX "centros_pais_idx" ON "centros" USING btree ("pais");
  CREATE INDEX "centros_estado_idx" ON "centros" USING btree ("estado");
  CREATE INDEX "centros_updated_at_idx" ON "centros" USING btree ("updated_at");
  CREATE INDEX "centros_created_at_idx" ON "centros" USING btree ("created_at");
  CREATE UNIQUE INDEX "personas_slug_idx" ON "personas" USING btree ("slug");
  CREATE INDEX "personas_grupo_idx" ON "personas" USING btree ("grupo");
  CREATE INDEX "personas_organizacion_idx" ON "personas" USING btree ("organizacion_id");
  CREATE INDEX "personas_foto_idx" ON "personas" USING btree ("foto_id");
  CREATE INDEX "personas_updated_at_idx" ON "personas" USING btree ("updated_at");
  CREATE INDEX "personas_created_at_idx" ON "personas" USING btree ("created_at");
  CREATE UNIQUE INDEX "personas_locales_locale_parent_id_unique" ON "personas_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "organizaciones_slug_idx" ON "organizaciones" USING btree ("slug");
  CREATE INDEX "organizaciones_logo_idx" ON "organizaciones" USING btree ("logo_id");
  CREATE INDEX "organizaciones_updated_at_idx" ON "organizaciones" USING btree ("updated_at");
  CREATE INDEX "organizaciones_created_at_idx" ON "organizaciones" USING btree ("created_at");
  CREATE UNIQUE INDEX "organizaciones_locales_locale_parent_id_unique" ON "organizaciones_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_locales_locale_parent_id_unique" ON "categorias_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documentos_updated_at_idx" ON "documentos" USING btree ("updated_at");
  CREATE INDEX "documentos_created_at_idx" ON "documentos" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_filename_idx" ON "documentos" USING btree ("filename");
  CREATE UNIQUE INDEX "documentos_locales_locale_parent_id_unique" ON "documentos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "mensajes_contacto_updated_at_idx" ON "mensajes_contacto" USING btree ("updated_at");
  CREATE INDEX "mensajes_contacto_created_at_idx" ON "mensajes_contacto" USING btree ("created_at");
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
  CREATE INDEX "payload_locked_documents_rels_labs_id_idx" ON "payload_locked_documents_rels" USING btree ("labs_id");
  CREATE INDEX "payload_locked_documents_rels_proyectos_id_idx" ON "payload_locked_documents_rels" USING btree ("proyectos_id");
  CREATE INDEX "payload_locked_documents_rels_publicaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("publicaciones_id");
  CREATE INDEX "payload_locked_documents_rels_entradas_id_idx" ON "payload_locked_documents_rels" USING btree ("entradas_id");
  CREATE INDEX "payload_locked_documents_rels_noticias_id_idx" ON "payload_locked_documents_rels" USING btree ("noticias_id");
  CREATE INDEX "payload_locked_documents_rels_centros_id_idx" ON "payload_locked_documents_rels" USING btree ("centros_id");
  CREATE INDEX "payload_locked_documents_rels_personas_id_idx" ON "payload_locked_documents_rels" USING btree ("personas_id");
  CREATE INDEX "payload_locked_documents_rels_organizaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("organizaciones_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documentos_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_id");
  CREATE INDEX "payload_locked_documents_rels_mensajes_contacto_id_idx" ON "payload_locked_documents_rels" USING btree ("mensajes_contacto_id");
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
  CREATE INDEX "sitio_redes_enlaces_order_idx" ON "sitio_redes_enlaces" USING btree ("_order");
  CREATE INDEX "sitio_redes_enlaces_parent_id_idx" ON "sitio_redes_enlaces" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sitio_locales_locale_parent_id_unique" ON "sitio_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "labs" CASCADE;
  DROP TABLE "labs_locales" CASCADE;
  DROP TABLE "proyectos_secciones_subsecciones" CASCADE;
  DROP TABLE "proyectos_secciones_subsecciones_locales" CASCADE;
  DROP TABLE "proyectos_secciones" CASCADE;
  DROP TABLE "proyectos_secciones_locales" CASCADE;
  DROP TABLE "proyectos" CASCADE;
  DROP TABLE "proyectos_locales" CASCADE;
  DROP TABLE "proyectos_rels" CASCADE;
  DROP TABLE "publicaciones" CASCADE;
  DROP TABLE "publicaciones_locales" CASCADE;
  DROP TABLE "publicaciones_rels" CASCADE;
  DROP TABLE "entradas" CASCADE;
  DROP TABLE "entradas_locales" CASCADE;
  DROP TABLE "entradas_rels" CASCADE;
  DROP TABLE "noticias" CASCADE;
  DROP TABLE "noticias_rels" CASCADE;
  DROP TABLE "centros" CASCADE;
  DROP TABLE "personas" CASCADE;
  DROP TABLE "personas_locales" CASCADE;
  DROP TABLE "organizaciones" CASCADE;
  DROP TABLE "organizaciones_locales" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "categorias_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "documentos" CASCADE;
  DROP TABLE "documentos_locales" CASCADE;
  DROP TABLE "mensajes_contacto" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "sitio_redes_enlaces" CASCADE;
  DROP TABLE "sitio" CASCADE;
  DROP TABLE "sitio_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_publicaciones_tipo";
  DROP TYPE "public"."enum_entradas_tipo";
  DROP TYPE "public"."enum_centros_estado";
  DROP TYPE "public"."enum_personas_grupo";
  DROP TYPE "public"."enum_users_rol";
  DROP TYPE "public"."enum_sitio_redes_enlaces_red";`)
}
