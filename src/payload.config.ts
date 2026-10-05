import path from "path";
import { fileURLToPath } from "url";
import { buildConfig, type Plugin } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import sharp from "sharp";

import { Users } from "./cms/collections/Users";
import { Media } from "./cms/collections/Media";
import { Documentos } from "./cms/collections/Documentos";
import { Categorias } from "./cms/collections/Categorias";
import { Labs } from "./cms/collections/Labs";
import { Proyectos } from "./cms/collections/Proyectos";
import { Publicaciones } from "./cms/collections/Publicaciones";
import { Entradas } from "./cms/collections/Entradas";
import { Noticias } from "./cms/collections/Noticias";
import { Centros } from "./cms/collections/Centros";
import { Personas } from "./cms/collections/Personas";
import { Organizaciones } from "./cms/collections/Organizaciones";
import { MensajesContacto } from "./cms/collections/MensajesContacto";
import { Sitio } from "./cms/globals/Sitio";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// El plugin se registra siempre para que sus componentes de cliente queden en
// el importMap del admin; sin bucket (desarrollo local) se desactiva y los
// archivos se guardan en disco.
const urlPublica = (filename: string) => `${process.env.S3_PUBLIC_URL}/${filename}`;

const plugins: Plugin[] = [
  s3Storage({
    enabled: Boolean(process.env.S3_BUCKET),
    collections: {
      media: { generateFileURL: ({ filename }) => urlPublica(filename) },
      documentos: { generateFileURL: ({ filename }) => urlPublica(filename) },
    },
    bucket: process.env.S3_BUCKET || "",
    // Subida directa desde el navegador (evita el límite de 4.5 MB de Vercel).
    // Requiere que S3_ENDPOINT sea alcanzable desde el navegador y CORS en el bucket.
    clientUploads: process.env.S3_CLIENT_UPLOADS === "true",
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "us-east-1",
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    },
  }),
];

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET || "",
  // Crea el admin al arrancar si la base no tiene usuarios y hay SEED_ADMIN_*,
  // así /api/users/first-register queda cerrado antes de servir la primera
  // petición y no hay ventana de toma de control (auditoría S-2).
  onInit: async (payload) => {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) return;
    const { totalDocs } = await payload.count({ collection: "users" });
    if (totalDocs > 0) return;
    await payload.create({
      collection: "users",
      data: { email, password, nombre: "Administración", rol: "admin" },
    });
    payload.logger.info(`Usuario admin creado en el arranque: ${email}`);
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      graphics: {
        Logo: "/cms/componentes/Logo#Logo",
        Icon: "/cms/componentes/Icono#Icono",
      },
      beforeLogin: ["/cms/componentes/AntesDeLogin#AntesDeLogin"],
      beforeDashboard: ["/cms/componentes/Bienvenida#Bienvenida"],
      afterNavLinks: ["/cms/componentes/EnlaceManual#EnlaceManual"],
      views: {
        manual: {
          Component: "/cms/componentes/Manual#Manual",
          path: "/manual",
          exact: true,
          meta: { title: "Manual de uso" },
        },
      },
    },
    meta: {
      titleSuffix: " | OLCD",
      icons: [
        { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
        { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
      ],
    },
  },
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: "es",
  },
  localization: {
    locales: [
      { label: "Español", code: "es" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "es",
    fallback: true,
  },
  collections: [
    Labs,
    Proyectos,
    Publicaciones,
    Entradas,
    Noticias,
    Centros,
    Personas,
    Organizaciones,
    Categorias,
    Media,
    Documentos,
    MensajesContacto,
    Users,
  ],
  globals: [Sitio],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    push: process.env.NODE_ENV === "development",
    prodMigrations: migrations,
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM || "no-reply@olcd.org",
        defaultFromName: "Observatorio Latinoamericano de Centros de Datos",
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins,
});
