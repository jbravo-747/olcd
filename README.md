# OLCD — Sitio y CMS

Sitio del **Observatorio Latinoamericano de Centros de Datos** con su gestor
de contenidos integrado. Nació como maqueta navegable a partir de dos insumos:

- `Navegación Observatorio.pdf` — árbol de navegación corregido (8 secciones, niveles N1/N2/N3).
- `Wireframes.zip` — 31 wireframes de escritorio y móvil (Figma → PDF).

El estilo visual (tipografías, paleta, componentes) replica el del prototipo
de referencia `olcd-org--olcd-org.us-central1.hosted.app`.

## Stack

| Pieza | Elección |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| CMS | Payload 3 embebido en la misma app (`/admin`) — ver `docs/cms.md` |
| Base de datos | Postgres (Neon en Vercel, contenedor en Docker) |
| Archivos | Bucket S3-compatible (R2/S3 en Vercel, MinIO en Docker) |
| Idiomas | ES/EN: contenido localizado en Payload, interfaz con next-intl (`/es`, `/en`) |
| Estilos | Tailwind CSS v4 (tokens en `src/app/(frontend)/globals.css`) |
| Tipografías | Roboto Condensed 900 (títulos) + Archivo (texto), vía `next/font` |

## Desarrollo local

Requisitos: Node 24, Postgres local.

```bash
cp .env.example .env          # ajustar DATABASE_URI y generar PAYLOAD_SECRET
npm install
npm run dev                   # http://localhost:3000  →  /es, /en, /admin
```

1. Entra a `http://localhost:3000/admin` y crea el primer usuario (admin).
2. `npm run seed` carga el contenido de la maqueta en ambos idiomas
   (los textos en inglés van con prefijo `[EN]` hasta que se traduzcan).

En desarrollo el esquema de la base se sincroniza solo (`push`). Sin
`S3_BUCKET` los archivos subidos se guardan en `media/` y `documentos/`.

Scripts útiles:

| Script | Qué hace |
|---|---|
| `npm run generate:types` | Regenera `src/payload-types.ts` tras cambiar colecciones |
| `npm run migrate:create` | Genera una migración en `src/migrations/` (producción) |
| `npm run migrate:status` | Muestra migraciones pendientes |
| `npm run seed` | Siembra el contenido inicial (no hace nada si ya hay datos) |
| `npm run build && npm start` | Build de producción (no requiere base de datos) |

## Despliegue

### Vercel + Neon (actual)

Variables de entorno (ver `.env.example`): `DATABASE_URI` (cadena *pooled* de
Neon), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `S3_*` de un bucket R2/S3
con `S3_CLIENT_UPLOADS=true` (y CORS en el bucket), `SMTP_*` y
`CONTACTO_DESTINO`. Las migraciones corren al arrancar.

### Infraestructura propia (Docker)

```bash
cp .env.example .env          # definir PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL, S3_PUBLIC_URL
docker compose up --build     # app :3000, Postgres, MinIO :9000 (consola :9001)
```

`docker-compose.yml` levanta Postgres, MinIO (crea el bucket público `olcd`)
y la app en modo `standalone`; `APP_PORT` cambia el puerto publicado (3000).
Las migraciones se aplican al primer arranque. Para cargar contenido:

- desde cero: `SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… docker compose run --rm seed`
  (servicio auxiliar que corre el seed dentro de la red de Docker y crea el
  usuario admin), o
- copiando otro entorno: `pg_dump` → `docker compose exec -T db psql -U olcd olcd`.
  Si el volcado viene de una base usada en desarrollo, borrar antes la marca de
  modo *push* (`DELETE FROM payload_migrations WHERE name = 'dev';`), porque
  Payload se detiene a pedir confirmación interactiva al verla.

En ambos casos, si el sitio ya se visitó antes de cargar contenido, ejecutar
`docker compose up -d --force-recreate app` para vaciar la caché de datos.

**Correo del formulario de contacto.** Con `SMTP_HOST` vacío los mensajes se
guardan igual en `/admin` → Administración → Mensajes de contacto, pero no se
envía ningún correo. Para activarlo basta definir `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` y `CONTACTO_DESTINO` en `.env` y
ejecutar `docker compose up -d app` (se leen al arrancar; no requiere rebuild).

## Mapa de páginas

| Ruta (bajo `/es` o `/en`) | Contenido |
|---|---|
| `/` | Inicio: hero, mapa resumido y lo más reciente |
| `/quienes-somos` | Propósito · Equipo · Directorio de organizaciones · Directorio de personas |
| `/quienes-somos/organizaciones/[slug]`, `/quienes-somos/personas/[slug]` | Fichas |
| `/ejes-de-trabajo`, `/ejes-de-trabajo/[lab]`, `/ejes-de-trabajo/[lab]/[proyecto]` | Labs y proyectos (carrusel + secciones) |
| `/mapa-de-centros-de-datos` | Mapa SVG de América Latina con filtros y ficha |
| `/buscador-de-noticias` | Búsqueda y paginación en servidor (`?q=&categoria=&pagina=`) |
| `/publicaciones`, `/publicaciones/[slug]` | Reportes · Artículos y libros · Recursos educativos |
| `/actualidad`, `/actualidad/[slug]` | Blog · Comunicados · Cobertura de prensa · Noticias |
| `/contacto` | Formulario (guarda en el admin y avisa por correo) |
| `/accesibilidad`, `/privacidad`, `/terminos-de-uso` | Textos legales editables |
| `/admin` | Panel de administración |

## Estructura

```
src/
├── app/
│   ├── (frontend)/[locale]/   # páginas del sitio (una carpeta por ruta)
│   └── (payload)/             # admin y API de Payload (generado)
├── cms/                       # colecciones, global, accesos, hooks
├── components/                # Header, Footer, rejillas, carrusel, mapa…
├── i18n/ · messages/ · proxy.ts   # next-intl (rutas /es y /en, textos de interfaz)
├── lib/cms/                   # lectura del CMS con caché por etiquetas
├── lib/navegacion.ts          # estructura del menú y del pie
├── seed/                      # contenido inicial (antigua src/data)
├── migrations/                # migraciones de Postgres
└── payload.config.ts
```

Para cambiar el menú se edita `src/lib/navegacion.ts` y las etiquetas en
`src/messages/{es,en}.json`. El resto del contenido se edita en `/admin`.

## Sistema de diseño

Los tokens de `src/app/(frontend)/globals.css` están copiados de las
variables CSS del prototipo de referencia.

| Token | Valor | Uso |
|---|---|---|
| `cream` | `#f5f1e9` | Fondo general y tarjetas |
| `cream-deep` | `#e8e5de` | Secciones alternas y manchas del hero |
| `ink` | `#1e2429` | Texto y pie |
| `ink-soft` | `#2f3336` | Barra de navegación, botones, etiquetas |
| `slate` | `#4a4e51` | Bandas oscuras de encabezado |
| `slate-light` | `#7c8083` | Marcadores de imagen y fondo del buscador |
| `teal` `green` `amber` `orange` `purple` | `#00a7b5` `#01ff5b` `#ffb000` `#e85d04` `#4a1c6b` | Acentos de marca |

Medidas fluidas con `clamp()` entre 386 px y 1440 px (`--fs-h1`,
`--fs-section`, `--fs-lead`, `--gutter`…). Clases utilitarias: `.display`,
`.shell`, `.t-h1`, `.t-section`, `.t-lead`, `.pill`, `.tag`, `.field`,
`.hero-pattern`, `.prosa` (texto enriquecido del CMS).

## Recursos de marca

`public/brand/`: `logo-olcd-horizontal.png` (header) y `logo-olcd-vertical.png`
(pie) son los logos oficiales con textura topográfica, en crema para fondos
oscuros, recortados y reducidos para web (los originales en alta resolución
viven en `docs/insumos/marca/`, fuera del repo); `hero-blobs-desktop.png` /
`-mobile.png` (máscara del hero) viene del prototipo de referencia. El
favicon (`public/favicon.ico`, `icon-192.png`, `icon-512.png`,
`apple-touch-icon.png`) es la "O" del logo sobre fondo `ink`, generado con
sharp a partir del original.

## Insumos originales

Los wireframes y el árbol de navegación (≈50 MB de PDF) viven en
`docs/insumos/` sólo en copia local (excluidos en `.gitignore`).

## Pendientes

1. Contenido real: los textos siguen siendo el lorem de los wireframes y las
   imágenes se suben desde `/admin`.
2. Registro real de centros de datos (los 12 son de muestra).
3. Traducciones al inglés (el seed las deja con prefijo `[EN]`).
4. Elegir bucket (R2/S3) y SMTP para producción.
