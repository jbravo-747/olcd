# CMS: decisión y funcionamiento

**Decisión (septiembre 2026):** Payload CMS 3 embebido en la misma aplicación
Next.js, con Postgres y almacenamiento S3-compatible. Combina lo mejor de las
dos opciones que se barajaron: un solo despliegue y control total del esquema
(opción A) con panel, roles, versiones e i18n ya resueltos (opción B).

## Piezas

| Pieza | Dónde |
|---|---|
| Configuración de Payload | `src/payload.config.ts` |
| Colecciones y global | `src/cms/collections/*`, `src/cms/globals/Sitio.ts` |
| Reglas de acceso | `src/cms/access/index.ts` (`admin` / `editor` / público) |
| Invalidación de caché | `src/cms/hooks/revalidar.ts` |
| Panel de administración | `/admin` (`src/app/(payload)/`) |
| API REST / GraphQL | `/api/*`, `/api/graphql` |
| Capa de lectura del sitio | `src/lib/cms/*.ts` (Local API + Data Cache por etiquetas) |
| Tipos generados | `src/payload-types.ts` (`npm run generate:types`) |
| Migraciones | `src/migrations/` (`npm run migrate:create`) |
| Seed con el contenido de la maqueta | `src/seed/index.ts` (`npm run seed`) |

## Modelo de contenido

Colecciones: `labs`, `proyectos` (→ lab), `publicaciones` (→ lab, pdf),
`entradas` (actualidad), `noticias` (corpus del buscador), `centros`,
`personas` (→ organización), `organizaciones`, `categorias`, `media`
(imágenes), `documentos` (PDF), `mensajes-contacto`, `users`.
Global: `sitio` (hero, propósito, encabezados de página, textos legales, redes).

Los campos de texto llevan `localized: true`: el admin muestra un selector
ES/EN y el sitio pide cada idioma con `locale`. Si falta la traducción se
usa el español (`fallback: true`).

## Cómo se sirve el contenido

Las páginas son dinámicas (`force-dynamic`) y leen con la Local API a través
de `src/lib/cms/*`, envuelto en `unstable_cache` con una etiqueta por
colección. Al guardar en el admin, los hooks `afterChange`/`afterDelete`
llaman `revalidateTag`, así que el cambio se ve en la siguiente carga sin
redeploy. Gracias a esto `next build` no necesita base de datos.

## Migraciones

- Desarrollo (`NODE_ENV=development`): `push: true`, Payload sincroniza el
  esquema solo. **Nunca** apuntar el modo desarrollo a la base de producción.
- Producción: las migraciones de `src/migrations/` corren al arrancar
  (`prodMigrations`). Tras cambiar colecciones: `npm run migrate:create`
  y commitear el archivo generado.

## Archivos

`@payloadcms/storage-s3` está siempre registrado en `payload.config.ts` y se
activa con `enabled: Boolean(S3_BUCKET)`. Se registra siempre porque el
importMap del admin (`src/app/(payload)/admin/importMap.js`) se genera a
partir de los plugins presentes: si el plugin sólo existiera con bucket, un
importMap generado en desarrollo no incluiría `S3ClientUploadHandler` y el
admin quedaría en blanco en producción. Con `S3_BUCKET` definido:
imágenes y PDF van a un bucket S3-compatible (Cloudflare R2 / AWS S3 con
Vercel, MinIO en Docker) y se sirven directamente desde `S3_PUBLIC_URL`, que
`next.config.ts` añade a `images.remotePatterns`. Sin `S3_BUCKET` se guardan en
disco (sólo desarrollo). Es la única bifurcación entre entornos y se decide por
configuración.

En Docker, `minio-init` crea el bucket público `olcd` en el primer arranque y
`app` recibe `S3_ENDPOINT=http://minio:9000` por la red interna. Para usar un
proveedor externo en lugar de MinIO basta quitar los servicios `minio` y
`minio-init` del compose y poner sus credenciales en `S3_*`.

## Correo

El adaptador de correo (`@payloadcms/email-nodemailer`) sólo se registra si
`SMTP_HOST` tiene valor; se evalúa al arrancar, no al compilar. Sin SMTP el
formulario de contacto sigue guardando cada mensaje en la colección
`mensajes-contacto` y sólo omite el aviso a `CONTACTO_DESTINO`. Para activarlo
después: definir `SMTP_*`, `EMAIL_FROM` y `CONTACTO_DESTINO` y reiniciar la app
(`docker compose up -d app` en Docker; redeploy en Vercel).

## Personalización del panel

El admin lleva la identidad del Observatorio:

- `src/app/(payload)/custom.scss`: variables de tema de Payload (`--theme-elevation-*`,
  acentos, radios, tipografías) con la paleta de `globals.css`, en claro y oscuro.
- `src/cms/componentes/`: logo del login (`Logo`), icono de la barra (`Icono`),
  texto de bienvenida en login y panel (`AntesDeLogin`, `Bienvenida`), enlace y
  vista del manual de uso (`EnlaceManual`, `Manual` → `/admin/manual`).
  Se registran en `admin.components` de `payload.config.ts`; al añadir o mover
  componentes hay que correr `npm run generate:importmap`.

## Usuarios

`admin` gestiona usuarios y ve los mensajes de contacto; `editor` sólo edita
contenido. El primer usuario se crea desde `/admin` al arrancar con la base
vacía (o con `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` al correr el seed).
