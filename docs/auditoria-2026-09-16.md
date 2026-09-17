# Auditoría de calidad y seguridad — 16 de septiembre de 2026

Alcance: repositorio completo en `main` (commit `89f7b06`), sin modificar código.
Herramientas: `/security-review` (metodología aplicada al repo entero, con segundo
pase de verificación de falsos positivos), `/code-review` en nivel alto (ejes
estándares y especificación, punto fijo `add4afc`), `/impeccable audit` sobre el
frontend público, `npm audit`, `tsc --noEmit`, lectura del seed, Dockerfile y
docker-compose.

Estado base: `tsc` pasa sin errores. No hay ESLint, Prettier ni ningún test.

## Resumen ejecutivo

| Severidad | Seguridad          | Calidad | Accesibilidad y UX |
| --------- | ------------------ | ------- | ------------------ |
| Crítico   | 0                  | 0       | 0                  |
| Alto      | 1                  | 2       | 7                  |
| Medio     | 1                  | 5       | 9                  |
| Bajo      | 1 + 7 dependencias | 4       | 5                  |

Lo que hay que arreglar primero, en orden:

1. Credenciales por defecto de MinIO y puertos 9000/9001 publicados en el compose (S-1).
2. Ventana de toma de control en el primer registro de usuario, y bloqueo si el primer usuario queda como editor (S-2).
3. La caché de `media` y `documentos` nunca se invalida (Q-1).
4. Error 500 en el buscador con parámetros repetidos (Q-2).
5. Contraste de texto por debajo de AA en varios bloques (A-1) y marcadores del mapa (A-2).
6. Metadata SEO ausente: sin canonical, hreflang, sitemap ni robots (Q-7 / A-6).

## Estado de corrección — 17 de septiembre de 2026

Aplicadas y verificadas con la suite de pruebas (78 unitarias/integración y E2E en verde):

| Hallazgo                     | Estado    | Cómo se corrigió                                                                                                                                                               |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S-1                          | Corregido | `docker-compose.yml`: contraseñas obligatorias, puertos MinIO ligados a `127.0.0.1`, política anónima sólo `GetObject` (bucket ya no listable). `.env.example` con las claves. |
| S-2                          | Corregido | Hook `beforeChange` en `Users` fuerza `rol: admin` al primer usuario; `onInit` crea el admin al arrancar con `SEED_ADMIN_*`.                                                   |
| S-3                          | Corregido | `media` limitado a mapa de bits, sin SVG. Test de rechazo activado.                                                                                                            |
| Q-1                          | Corregido | `revalidarColeccion` en `Media` y `Documentos`.                                                                                                                                |
| Q-2                          | Corregido | `searchParams` normaliza parámetros repetidos. Test E2E activado.                                                                                                              |
| Q-3                          | Corregido | `listarPublicaciones` ordena descendente; la portada intercala hasta el tipo más largo.                                                                                        |
| Q-4                          | Corregido | Los tres grids recortan la página al total al filtrar.                                                                                                                         |
| Q-5                          | Corregido | El buscador reconsulta la última página válida. Test E2E activado.                                                                                                             |
| Q-6                          | Corregido | El seed crea el admin aunque ya haya contenido. Test activado.                                                                                                                 |
| Q-7 / A-6                    | Corregido | `metadataBase`, `alternates` per-ruta, `sitemap.ts`, `robots.ts`, descripciones por página.                                                                                    |
| S-4                          | Parcial   | `npm audit fix` resolvió `dompurify`; quedan 5 moderadas dev-only de `esbuild`/`drizzle-kit` sin fix upstream.                                                                 |
| A-1, A-2, A-5, A-7, A-8, A-9 | Corregido | Contraste a AA, marcadores con forma y color, errores por campo en el formulario, placeholders decorativos, estados vacíos, `error.tsx` y `global-error.tsx`.                  |
| A-3, A-4, A-10 a A-16        | Pendiente | Mapa por teclado, carrusel, proyección de datos al cliente, tipografía móvil, áreas táctiles, i18n residual, theming. No bloquean.                                             |

---

## Seguridad

### S-1. Credenciales por defecto y MinIO expuesto — Alta

`docker-compose.yml:24-28,44-45,73-74`

MinIO arranca con `olcd` / `olcd-minio-secret` como usuario raíz y publica 9000 (API S3) y 9001 (consola) en todas las interfaces. `.env.example` no incluye `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` ni `POSTGRES_PASSWORD`, así que el flujo documentado deja los valores por defecto. Docker publica puertos saltándose `ufw`.

Escenario: quien lea el compose en el repo hace `mc alias set x http://<host>:9000 olcd olcd-minio-secret` y tiene control total del bucket: borra o sustituye PDFs e imágenes, sube HTML para phishing bajo el dominio de archivos, o entra a la consola en 9001 como root. Además, `mc anonymous set download` permite listar el bucket completo.

Corrección:

- `MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?Define MINIO_ROOT_PASSWORD}` y lo mismo para `POSTGRES_PASSWORD`; añadir ambas a `.env.example`.
- No publicar 9001, o publicarlo como `127.0.0.1:9001:9001`. Servir 9000 solo detrás del reverse proxy con TLS, limitado a `GET /olcd/*`.
- Crear un usuario S3 con política restringida al bucket para la app, en vez de usar la cuenta raíz.

Postgres no publica puerto, así que su clave por defecto solo importa dentro de la red Docker.

Confirmado en tiempo de ejecución contra el contenedor: `GET http://localhost:9000/olcd/?list-type=2` responde 200 con `ListBucketResult` sin credenciales, es decir el bucket es listable de forma anónima, no solo descargable. La consola en 9001 responde 200. Es el hallazgo de mayor severidad verificado en vivo.

### S-2. Primer registro de usuario sin autenticación y bloqueo por rol — Media

`src/cms/collections/Users.ts:23-32`, `docker-compose.yml:84-90`

Payload expone `POST /api/users/first-register` sin autenticación mientras la tabla `users` esté vacía. Crea el usuario con `overrideAccess: true` y acepta cualquier campo del body, incluido `rol: "admin"`. En el compose, la app se publica en 3000 al arrancar y la creación del admin es un paso manual posterior. Verificado en `payload/dist/auth/endpoints/index.js:52-54` y `registerFirstUser.js:26-42`.

Segundo problema, confirmado: el formulario de primer usuario del admin muestra `rol` preseleccionado en "Editor". Si el operador no lo cambia, el primer usuario queda como editor sin ningún admin. Como `create: esAdmin` y `rol` solo lo actualiza un admin, no hay forma de repararlo desde el CMS. El seed tampoco ayuda porque aborta si ya hay usuarios. Solo se recupera por SQL.

Nota importante: añadir `access.create` al campo `rol` no mitiga nada. Con `overrideAccess: true` Payload omite el acceso de campo (`fields/hooks/beforeValidate/promise.js:218`).

Corrección:

- Hook `beforeChange` en `Users`: si `operation === "create"` y `payload.count({ collection: "users" })` es 0, forzar `data.rol = "admin"`. Cierra el bloqueo y hace irrelevante el rol enviado.
- Eliminar la ventana: crear el admin en `onInit` leyendo `SEED_ADMIN_*` cuando no haya usuarios, o publicar la app como `127.0.0.1:3000:3000` detrás del proxy.

### S-3. SVG con script aceptado en `media` — Baja

`src/cms/collections/Media.ts:15`

`mimeTypes: ["image/*"]` admite `image/svg+xml`. La validación de SVG de Payload se salta cuando el archivo empieza con prólogo `<?xml`: `file-type` lo detecta como XML, Payload lo reclasifica como SVG y `validateSvg` solo corre en la rama `if (!detected)` (`payload/dist/uploads/checkFileRestrictions.js:288-305`). Aun sin prólogo, `validateSvg` es una lista negra por regex que no cubre entidades ni `<set attributeName="onload">`.

El handler `/api/media/file/*` sí añade `Content-Security-Policy: script-src 'none'`, pero el sitio usa `S3_PUBLIC_URL` y MinIO sirve el objeto con `Content-Type: image/svg+xml` sin CSP.

Por qué es Baja: requiere cuenta de editor, el sitio solo muestra media vía `<img>` (no ejecuta script), y el bucket vive en un origen sin cookies (`archivos.olcd.org` según la guía de despliegue). Sube a Media si el bucket llega a servirse bajo el dominio del sitio.

Corrección: `mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]`. Los logos SVG pueden vivir en `public/`. Si se necesita SVG subido, sanear con DOMPurify en `beforeValidate` y añadir en el proxy `Content-Security-Policy "script-src 'none'; sandbox"` a `*.svg`. Vale la pena reportar el salto de `validateSvg` a Payload.

### S-4. Dependencias — Baja

`npm audit`: 7 vulnerabilidades, 1 baja y 6 moderadas, ninguna alta ni crítica.

- `dompurify` ≤ 3.4.12 vía `monaco-editor` (admin de Payload): 4 avisos moderados. Hay fix con `npm audit fix`.
- `esbuild` ≤ 0.24.2 vía `drizzle-kit` → `@payloadcms/db-postgres`: solo afecta al servidor de desarrollo. Sin fix disponible.

### Hipótesis revisadas y descartadas

- Correos de `personas` y `organizaciones` en la API pública: ya se muestran en las fichas públicas del sitio. Sin exposición adicional. `users` y `mensajes-contacto` no son legibles anónimamente.
- Formulario de contacto: `overrideAccess` del Local API es intencional. `z.email()` rechaza CR/LF y nodemailer limpia cabeceras. Sin inyección.
- Escalada editor a admin por API: `rol` bloqueado por acceso de campo, `update` y `read` acotados a `id = user.id`.
- GraphQL: playground e introspección desactivados en producción por defecto; mismas reglas de acceso que REST.
- Docker: el runner no hereda los `ENV` del builder; `.env` excluido por `.dockerignore` y nunca versionado.
- Búsqueda `q`: `like` se traduce a `ilike` parametrizado por Drizzle. Sin inyección SQL.
- Slugs y rutas: solo llegan a `where: { slug: { equals } }`. `remotePatterns` cerrado al host del bucket.
- URLs editables en `<a href>`: React 19 bloquea `javascript:`. CSRF cubierto por la allowlist de Payload.

### Lo que está bien

- Validación estricta con zod y honeypot en el contacto.
- Reglas de acceso coherentes y control de campo en `rol`.
- Dockerfile multietapa, usuario no root, secretos solo en tiempo de ejecución, `PAYLOAD_SECRET` obligatorio.
- Bloqueo de login tras 5 intentos por defecto de Payload.
- `documentos` limitado a PDF con validación de estructura.
- Sin `dangerouslySetInnerHTML`, `eval` ni acceso a `fs` en `src/`.

---

## Calidad

### Bugs confirmados

**Q-1. Caché de `media` y `documentos` nunca se invalida — Alto.**
`src/cms/collections/Media.ts` y `Documentos.ts` no registran `revalidarColeccion`, pero la capa de lectura etiqueta con `"media"` y `"documentos"` (`src/lib/cms/{labs,publicaciones,actualidad,personas,organizaciones}.ts`). Cambiar el `alt`, el crédito o reemplazar una imagen o PDF no se refleja hasta que se guarde otra colección o se recree el contenedor. Contradice `docs/cms.md` sección "Cómo se sirve el contenido".

**Q-2. Error 500 en el buscador con parámetros repetidos — Alto.**
`src/app/(frontend)/[locale]/buscador-de-noticias/page.tsx:11,27,35`. `searchParams` está tipado como `string`, pero Next entrega `string | string[]`. `?q=a&q=b` produce `q.trim is not a function` y responde 500, confirmado en runtime. Matiz: `?categoria=a&categoria=b` por sí solo devolvió 200 en este build; el 500 se dispara con `q` repetido. La página de error es la genérica de Next, sin traza ni fuga. Fix: normalizar cada parámetro con `Array.isArray(x) ? x[0] : x` o `.at(-1)`.

**Q-3. "Reciente" muestra lo más antiguo — Medio.**
`src/lib/cms/publicaciones.ts:12` ordena `createdAt` ascendente y la portada toma `.slice(0, 4)`. Además la sección itera solo `reportes`: con cero reportes y diez entradas de blog queda vacía.

**Q-4. Página fuera de rango al refinar filtros — Medio.**
`src/components/GridRecursos.tsx:35-37` no reinicia `pagina` al cambiar `recursos`. Buscar "a" (30 resultados), ir a página 3, refinar a "ab" (5 resultados): rejilla vacía y paginación oculta.

**Q-5. Buscador con `pagina` mayor que `totalPages` — Medio.**
`buscador-de-noticias/page.tsx:100`: `totalDocs > 0` pero `docs = []`, lista vacía sin el mensaje "sin resultados".

**Q-6. Seed no reanudable ni crea admin sobre base restaurada — Medio.**
`src/seed/index.ts:383-387` sale si hay labs, antes de `sembrarAdmin` (línea 407). Con base restaurada por `pg_dump` sin usuarios, `SEED_ADMIN_*` no crea nada, contradiciendo README. Un fallo a mitad (categorías creadas, labs no) hace que la repetición choque con `slug unique`.

**Q-7. SEO ausente — Medio.**
Sin `metadataBase`, `alternates` en el metadata de las páginas, `sitemap.ts` ni `robots.ts`. La portada en `/es` y `/en` es contenido duplicado sin canonical. Una sola `description`, en español también en `/en`. Matiz confirmado en runtime: next-intl sí emite `hreflang` es/en/x-default por cabecera HTTP `Link`, así que ese aspecto concreto ya está cubierto; falta el resto.

**Q-8. Menores — Bajo.**
`Header.tsx:28` cambia de idioma con `href={pathname}` y pierde la querystring del buscador. Títulos de respaldo en `generateMetadata` fijos en español ("Publicación", "Persona"). `S3_BUCKET` sin `S3_PUBLIC_URL` genera URLs `undefined/archivo`. El servicio `seed` del compose no fija `NODE_ENV`, así que en frío falla por tablas inexistentes si `app` no migró antes.

### Desviaciones de la especificación

- `docs/cms.md` promete una etiqueta por colección con invalidación por hook: incumplido para `media` y `documentos` (Q-1).
- README promete crear el admin "al correr el seed": solo si la base está vacía de contenido (Q-6).
- README dice que el primer usuario es admin: nace como editor por defecto (S-2).
- `buscarNoticias` no se cachea. Aceptable, pero el comentario que lo justifica es incorrecto (`unstable_cache` ya incluye los argumentos en la clave) y la doc no lo refleja.
- El menú fija cinco slugs de labs en `src/lib/navegacion.ts:27-31` aunque viven en el CMS. Renombrar un slug en `/admin` rompe el menú sin aviso. README lo declara intencional.
- Fuera de la doc pero razonable: `serverActions.allowedOrigins`, `images.unoptimized` para localhost, honeypot, `timeZone: "UTC"`, ruta `/api/graphql-playground`.

Todo lo demás conforme: 8 secciones N1/N2/N3 con página para cada href, ES/EN con fallback, 152 claves i18n idénticas en ambos idiomas, roles, `force-dynamic` sin `generateStaticParams`, S3 siempre registrado, `push` en dev y `prodMigrations` en prod, seed bilingüe, perfil `herramientas`, contacto, mapa y buscador.

### Deuda de diseño (juicio, no violaciones)

- **Código duplicado**: el bloque `dt/dd` de datos repetido en 5 páginas de detalle; `<ul>` de categorías por 4; botón "Descargar PDF" por 3; las tres páginas legales idénticas salvo la clave; 8 funciones `listar*/buscar*` con la misma forma; paginación local copiada en tres grids; `flechaSelect` y `slugificar`/`idDe` duplicados.
- **Primitivos**: etiquetas de caché como `string` libre. Con `CollectionSlug` de Payload, Q-1 habría sido un error de tipo.
- **Catálogos repetidos**: `tiposPublicacion`, `tiposActualidad`, `gruposPersona`, `estadosCentro` se re-listan en 5 sitios. Añadir un tipo toca todos.
- **Feature envy**: la portada construye `Recurso` desde docs de Payload tres veces. Cabe un `aRecurso()` en `lib/cms/util.ts`.
- Índices mágicos `navegacion[0].hijos`, tres componentes llamados `Pagina`, `await` inline en JSX.

---

## Accesibilidad, UX y rendimiento del frontend

Puntuación Impeccable: 13/20. Accesibilidad 2, Rendimiento 3, Responsive 2, Theming 3, Integridad 3. El sistema visual es propio y coherente; los fallos son aislados.

### Alto

**A-1. Contraste por debajo de AA.** `MapaCentros.tsx:108,131` leyenda y países `cream/90` sobre `slate-light` = 3.19:1. `buscador-de-noticias/page.tsx:96` conteo = 3.02. `SeccionesDesplegables.tsx:55` `ink/50` sobre `paper` = 2.98. `FormularioContacto.tsx:86,91` `orange` sobre `cream` = 3.11. `dt` de 12px `ink/55` en fichas = 3.51. Fix: `cream` al 100% sobre `slate-light` o cambiar a `slate` (7.46:1); mínimo `ink/70`; errores en `text-ink` con icono o un naranja oscuro.

**A-2. Marcador "en construcción" invisible.** `MapaCentros.tsx:23` `#7a6a4f` sobre `slate-light` = 1.32:1 y el estado se codifica solo por color. Fix: formas distintas y colores ≥ 3:1.

**A-3. Mapa en inicio tabulable sin propósito.** `MapaCentros.tsx:89-97`: cada centro es `role="button" tabIndex={0}` también en modo resumido; N paradas de teclado sin ficha y sin foco visible. Fix: `aria-hidden` sin `tabIndex` en resumido; `focus-visible` en el mapa completo.

**A-4. Carrusel.** `Carrusel.tsx:63-69` puntos de 8×8px; el contador no es `aria-live`. Fix: área de 24 a 44px y `aria-live="polite"`.

**A-5. Formulario de contacto sin errores por campo.** `FormularioContacto.tsx:35-72`: `estado.errores` llega pero no se renderiza; el campo inválido solo cambia el borde; sin indicador de obligatorio; el foco no se mueve. Fix: `<p id="err-x">` traducido con `aria-describedby`, "(obligatorio)" en el label, enfocar el primer inválido.

**A-6. SEO y metadata.** Ver Q-7. Además sin `openGraph`.

**A-7. Placeholders de maqueta en producción.** `Marcador.tsx:3`, `Imagen.tsx:12`, `GridPersonas.tsx:39`, `GridOrganizaciones.tsx:35` y fichas: `[Foto]`, `[Logo]`, `[Imagen]` literales sin traducir cuando falta imagen. Fix: bloque decorativo `aria-hidden` con iniciales o marca.

### Medio

- **A-8. Estados vacíos**: portada, `[lab]`, `quienes-somos`, `ExploradorPublicaciones` renderizan `h2` con `<ul>` vacío; legales quedan en blanco si el global está vacío.
- **A-9. Sin `error.tsx` ni `loading.tsx`**: `Footer.tsx:11` llama a `obtenerSitio`; si Postgres cae, cae todo el sitio incluido `not-found`.
- **A-10. Carga excesiva al cliente**: hasta 500 docs con objetos `Media` completos serializados a componentes cliente solo para paginar en JS. `MapaCentros` hasta 1000 centros. Fix: proyectar a `{url, alt, width, height}`, paginar por querystring con `PaginacionEnlaces` y dejar los grids como Server Components.
- **A-11.** `MapaCentros.tsx:194` `aria-live` sobre todo el `<aside>` re-anuncia la lista completa en cada filtro.
- **A-12. Etiquetas engañosas**: "Compartir en {red}" enlaza al perfil de OLCD; `aria-label={red.red}` expone el slug.
- **A-13. Tipografía móvil**: `--fs-tag` 10.2px y `--fs-card-desc` 9.68px a 386px; 27 usos de `text-[13px]/[15px]` fijos.
- **A-14. Áreas táctiles**: botón de menú 24×24 sin padding; iconos sociales 24px.
- **A-15. i18n residual**: `aria-roledescription="carrusel"` fijo, títulos de respaldo en español, "GMT" literal, "PDF" fijo.
- **A-16. Theming**: hex fuera de tokens en el mapa, `flechaSelect` duplicada, `#fff` suelto, tokens `teal/green/amber/purple` sin uso.

### Bajo

- `globals.css:276` `transition-duration: 0.01ms !important` global; usar `transition: none` selectivo.
- Roboto Condensed 700 se descarga y no se usa.
- Logos PNG de 356KB y 560KB; pasar a SVG.
- Encabezados: h3 de grupo seguido de h3 de persona; h3 "Resultados" sin h2.
- Leyenda del mapa puede solapar marcadores del cono sur en anchos sm/md.

### Lo que está bien

Landmarks completos, skip-link, `lang` dinámico, `focus-visible` global, `alt` obligatorio y localizado, `next/font` con `swap`, todas las llamadas a `<Imagen>` pasan `sizes`, fechas con `useFormatter` en UTC, buscador paginado por enlaces sin JS, `useMemo` en filtros, paridad de claves i18n al 100%.

---

## Plan de corrección sugerido

1. **Seguridad inmediata**: S-1 (compose y `.env.example`), S-2 (hook en Users y admin en `onInit`), S-3 (mimeTypes raster), `npm audit fix`.
2. **Bugs de calidad**: Q-1 (hooks en Media y Documentos), Q-2 (normalizar `searchParams`), Q-3, Q-4, Q-5, Q-6.
3. **Accesibilidad alta**: A-1 a A-5, A-7.
4. **SEO**: Q-7 / A-6 con `metadataBase`, `alternates`, `sitemap.ts`, `robots.ts`.
5. **Deuda**: extraer componentes duplicados, tipar etiquetas de caché con `CollectionSlug`, centralizar catálogos.
6. **Base de pruebas** (fase 2 del plan): sin tests hoy, cada corrección anterior debería llegar con el suyo.
