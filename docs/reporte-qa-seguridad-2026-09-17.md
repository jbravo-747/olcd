# Reporte de calidad y seguridad — OLCD

**Fecha:** 17 de septiembre de 2026
**Alcance:** auditoría, base de pruebas y corrección de hallazgos sobre el sitio y CMS del
Observatorio Latinoamericano de Centros de Datos (Next.js 16 + Payload CMS 3 + Postgres + S3).
**Punto de partida:** rama `main` sin ningún test propio.

---

## 1. Qué se hizo

Se ejecutó un plan de cuatro fases: auditoría sin tocar código, creación de una base de
pruebas, ejecución de todo con la app corriendo, y un sondeo de seguridad ofensiva. Luego se
corrigieron los hallazgos y se verificó cada corrección con la suite de pruebas.

Documentos relacionados:

- `docs/auditoria-2026-09-16.md` — hallazgos con severidad, archivo y línea, y tabla de estado de corrección.
- `PLAN-QA-SEGURIDAD.md` — plan por fases (archivo local, fuera de git).

## 2. Herramientas incorporadas

- **Pruebas:** Vitest (unitarias e integración) y Playwright (E2E, escritorio y móvil), contra un Postgres desechable.
- **Pre-commit:** Husky con lint-staged (Prettier), typecheck y pruebas unitarias.
- **Seguridad:** revisión de código y de seguridad integradas, más los skills de QASkills (`auth-bypass-tester`, `api-fuzzing`, `dead-link-detector`).

## 3. Hallazgos y correcciones

### Seguridad

| ID  | Severidad | Hallazgo                                                                                                                   | Corrección                                                                                                                                  |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| S-1 | Alta      | MinIO con credenciales por defecto, puertos 9000/9001 públicos y bucket listable de forma anónima (confirmado en runtime). | Contraseñas obligatorias en el compose, puertos ligados a `127.0.0.1`, política anónima sólo `GetObject`. Claves añadidas a `.env.example`. |
| S-2 | Media     | Toma de control por el primer registro sin autenticar, y bloqueo si el primer usuario nace editor.                         | Hook `beforeChange` que fuerza `rol: admin` al primer usuario, y `onInit` que crea el admin al arrancar con `SEED_ADMIN_*`.                 |
| S-3 | Baja      | La colección `media` aceptaba SVG con script.                                                                              | Limitada a mapa de bits (`jpeg/png/webp/gif/avif`).                                                                                         |
| S-4 | Baja      | 7 vulnerabilidades de dependencias.                                                                                        | `npm audit fix` resolvió `dompurify`; quedan 5 moderadas dev-only de `esbuild`/`drizzle-kit` sin fix upstream.                              |

El control de acceso de la API REST y GraphQL se verificó sólido: sin fuga de usuarios ni
hashes, sin inyección SQL, salida escapada por React, introspección y playground de GraphQL
desactivados en producción, y sin enlaces rotos en las 38 rutas de navegación.

### Calidad (bugs de corrección)

| ID  | Severidad | Hallazgo                                                            | Corrección                                                                                  |
| --- | --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Q-1 | Alto      | La caché de `media` y `documentos` nunca se invalidaba.             | `revalidarColeccion` en ambas colecciones.                                                  |
| Q-2 | Alto      | Error 500 en el buscador con parámetros repetidos (`?q=a&q=b`).     | Normalización de `searchParams`.                                                            |
| Q-3 | Medio     | "Reciente" mostraba lo más antiguo y se vaciaba si faltaba un tipo. | Orden descendente y recorrido hasta el tipo más largo.                                      |
| Q-4 | Medio     | Paginación quedaba vacía al estrechar un filtro.                    | Los grids recortan la página al total.                                                      |
| Q-5 | Medio     | Página fuera de rango mostraba lista vacía sin mensaje.             | El buscador reconsulta la última página válida.                                             |
| Q-6 | Medio     | El seed no creaba el admin sobre una base restaurada.               | Crea el admin aunque ya haya contenido.                                                     |
| Q-7 | Medio     | Metadata SEO ausente.                                               | `metadataBase`, `alternates` per-ruta, `sitemap.ts`, `robots.ts`, descripciones por página. |

### Accesibilidad y UX

Corregidos: contraste a nivel AA en los bloques oscuros y etiquetas (A-1), marcadores del mapa
con forma además de color (A-2), errores por campo y foco en el formulario de contacto (A-5),
placeholders decorativos sin texto de maqueta (A-7), estados vacíos (A-8), y límites de error
`error.tsx` y `global-error.tsx` (A-9).

Pendientes no bloqueantes: navegación por teclado del mapa, carrusel, proyección de datos al
cliente, tipografía móvil, áreas táctiles, i18n residual y limpieza de theming (A-3, A-4, A-10 a A-16).

## 4. Verificación

| Suite                            | Resultado                                       |
| -------------------------------- | ----------------------------------------------- |
| Vitest (unitarias e integración) | 78 en verde, 0 omitidas                         |
| Playwright (escritorio y móvil)  | 158 en verde, 8 `fixme` intencionales, 0 fallos |
| Typecheck (`tsc --noEmit`)       | limpio                                          |

Los tests que documentaban hallazgos abiertos (S-3, Q-2, Q-5, Q-6) se activaron y pasan tras las
correcciones. La app corregida se levantó en local y se verificó a mano: login de admin, buscador,
mapa, formulario y las rutas de SEO.

## 5. Cómo correr las pruebas

Ver la sección "Pruebas" del `README.md`. En resumen: un contenedor Postgres desechable en el
puerto 5433, `npm run test` para unitarias e integración, `npm run test:e2e` para las E2E.

## 6. Notas de operación

- **Despliegue Docker:** ahora exige definir `POSTGRES_PASSWORD` y `MINIO_ROOT_PASSWORD`. Los
  puertos de MinIO se publican sólo en `localhost`; para exponer archivos, poner un proxy con TLS
  delante del 9000. Ver `README.md` y `.env.example`.
- **Primer arranque:** definir `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` crea el admin al iniciar y
  cierra la ventana del primer registro.
- **robots.txt** vive en `src/app/robots.ts` (raíz de `app`); dentro del grupo de rutas no se
  resolvía con Turbopack. `sitemap.ts` sí funciona en el grupo.
