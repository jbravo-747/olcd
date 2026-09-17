# OLCD — Maqueta del sitio

Maqueta navegable del **Observatorio Latinoamericano de Centros de Datos**,
construida a partir de dos insumos:

- `Navegación Observatorio.pdf` — árbol de navegación corregido (8 secciones, niveles N1/N2/N3).
- `Wireframes.zip` — 31 wireframes de escritorio y móvil (Figma → PDF).

El estilo visual (tipografías, paleta, componentes) replica el del prototipo
de referencia `olcd-org--olcd-org.us-central1.hosted.app`, que sólo tenía la
página de Inicio.

## Cómo correrla

```bash
npm install
npm run dev
```

Queda en http://localhost:3000. Para el build de producción: `npm run build && npm start`.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Mismo stack del prototipo de referencia; permite meter un CMS después sin rehacer el front |
| Estilos | Tailwind CSS v4 (config CSS-first en `globals.css`) | Tokens de color y tipografía en un solo lugar |
| Tipografías | Roboto Condensed 900 (títulos) + Archivo (texto) | Las mismas del prototipo |
| Contenido | Archivos TS en `src/data/` | Frontera limpia para sustituir por un CMS |

Todo el sitio se prerenderiza estático (151 rutas), así que puede publicarse
en Firebase App Hosting, Vercel o cualquier hosting estático.

## Mapa de páginas

| Ruta | Wireframe |
|---|---|
| `/` | 1. INICIO / N1 - Inicio |
| `/quienes-somos` | 2. QUIENES SOMOS / N1 (Propósito · Equipo · Directorio de organizaciones · Directorio de personas) |
| `/quienes-somos/organizaciones/[slug]` | N2 - Organizaciones |
| `/quienes-somos/personas/[slug]` | N2 - Personas |
| `/ejes-de-trabajo` | 3. EJES DE TRABAJO / N1 |
| `/ejes-de-trabajo/[lab]` | N2 - Página interna de lab (5 labs) |
| `/ejes-de-trabajo/[lab]/[proyecto]` | N3 - Proyectos lab (carrusel + secciones desplegables) |
| `/mapa-de-centros-de-datos` | Sección 4 del árbol (sin wireframe): marcador interactivo con filtros y ficha |
| `/buscador-de-noticias` | 5. BUSCADOR DE NOTICIAS / N1 |
| `/publicaciones` | 6. PUBLICACIONES / N1 (Reportes · Artículos y libros · Recursos educativos o multimedia) |
| `/publicaciones/[slug]` | N2 - Recurso |
| `/actualidad` | Sección 7 del árbol (sin wireframe): Blog · Comunicados · Cobertura de prensa · Noticias del Observatorio |
| `/actualidad/[slug]` | Página interna de Actualidad |
| `/contacto` | Sección 8 del árbol (sin wireframe) |
| `/accesibilidad`, `/privacidad`, `/terminos-de-uso` | Enlaces legales del pie |

Las secciones 4, 7 y 8 no venían en el zip de wireframes: se construyeron
siguiendo el árbol de navegación y los patrones visuales de las demás páginas.

## Insumos originales

Los wireframes y el árbol de navegación originales (≈50 MB de PDFs) viven en
`docs/insumos/` sólo en copia local: están excluidos del repositorio en
`.gitignore`. Para consultarlos, pedirlos al equipo o guardarlos en el Drive.

## Estructura

```
src/
├── app/            # una carpeta por ruta (App Router)
├── components/     # Header, Footer, rejillas, carrusel, mapa, buscador…
└── data/           # contenido y navegación (lo que reemplazará el CMS)
    ├── navegacion.ts   # menú + pie: única fuente de la navegación
    ├── labs.ts         # ejes de trabajo y sus proyectos
    ├── publicaciones.ts
    ├── actualidad.ts
    ├── noticias.ts     # corpus del buscador
    ├── centros.ts      # puntos del mapa
    ├── personas.ts / organizaciones.ts
    └── lorem.ts        # textos de relleno de los wireframes
```

Para cambiar el menú se edita **sólo** `src/data/navegacion.ts`.

## Sistema de diseño

Los tokens de `src/app/globals.css` están copiados de las variables CSS del
prototipo de referencia, así que ambos sitios coinciden al pixel.

| Token | Valor | Uso |
|---|---|---|
| `cream` | `#f5f1e9` | Fondo general y tarjetas |
| `cream-deep` | `#e8e5de` | Secciones alternas y manchas del hero |
| `ink` | `#1e2429` | Texto y pie |
| `ink-soft` | `#2f3336` | Barra de navegación, botones, etiquetas |
| `slate` | `#4a4e51` | Bandas oscuras de encabezado |
| `slate-light` | `#7c8083` | Marcadores de imagen y fondo del buscador |
| `teal` `green` `amber` `orange` `purple` | `#00a7b5` `#01ff5b` `#ffb000` `#e85d04` `#4a1c6b` | Acentos de marca, aún sin asignar a componentes |

**Medidas fluidas.** No hay tamaños fijos de tipografía: todo interpola con
`clamp()` entre 386 px y 1440 px de ancho de ventana (`--fs-h1`, `--fs-section`,
`--fs-lead`, `--gutter`…). El contenedor `.shell` usa
`max-width: calc(1228px + 2 * var(--gutter))` con `padding-inline: var(--gutter)`,
que es exactamente el `.olcd-container` del prototipo: el contenido se centra y
respira en pantallas grandes sin estirarse.

Clases utilitarias: `.display` (títulos), `.shell` (contenedor), `.t-h1`,
`.t-section`, `.t-lead`, `.t-card-title`, `.t-card-desc`, `.pill`, `.tag`,
`.field`, `.hero-pattern`.

## Recursos de marca

En `public/brand/`, tomados del prototipo de referencia:

| Archivo | Uso |
|---|---|
| `logo-olcd-horizontal.png` | Logo del header |
| `logo-olcd-vertical.png` | Logo del pie |
| `hero-blobs-desktop.png` / `-mobile.png` | Máscara de las manchas del hero (`.hero-pattern`) |
| `../favicon.ico` | Icono del sitio |

Las tipografías (Roboto Condensed 900 y Archivo) se cargan con `next/font`, no
hay archivos que versionar.

## Qué falta (pendientes de contenido, no de maqueta)

1. **Contenido real**: los textos son el lorem de los wireframes y las imágenes
   son marcadores `[Imagen]` / `[Foto]` / `[Logo]`.
2. **Mapa de centros de datos**: el mapa ya es real — SVG de 26 países de
   América Latina (`src/data/latam.json`, derivado de Natural Earth 110m) con
   proyección Mercator propia (`src/lib/proyeccion.ts`) y marcadores por
   lat/long. Lo que falta es el registro verdadero de centros: los 12 de
   `src/data/centros.ts` son de muestra (coordenadas reales, datos
   ilustrativos). Si más adelante se necesita zoom o capas, ahí sí conviene
   pasar a MapLibre.
3. **Inglés**: el conmutador `ES` del header está puesto pero no cambia idioma;
   falta decidir si se usa `next-intl` o rutas `/es` y `/en`.
4. **Formulario de contacto**: no envía; falta endpoint o servicio.
5. **CMS**: ver `docs/cms.md`.
