# Nota sobre el CMS

La maqueta no incluye CMS: todo el contenido vive en `src/data/*.ts`, con
tipos explícitos. Esa frontera es a propósito — cuando se elija el CMS, sólo
hay que cambiar el cuerpo de esas funciones por llamadas a la API; las páginas
y componentes no cambian.

Las opciones que están sobre la mesa (según las notas del proyecto):

## A. CMS propio sobre Next.js

- Panel de administración como parte de la misma app de Next (rutas
  protegidas), con **Auth0** para autenticación.
- Ventaja: un solo despliegue, control total del modelo de datos, se ajusta
  exactamente al árbol de navegación del Observatorio.
- Costo: hay que construir y mantener el panel, la subida de archivos y los
  permisos.

## B. Software libre autoalojado (Docker)

- Un CMS headless de código abierto (Strapi, Directus, Payload) en un
  contenedor, con Next consumiendo su API.
- Ventaja: panel, roles, versiones y subida de archivos ya resueltos; sin
  dependencia de un proveedor.
- Costo: hay que operar el contenedor, la base de datos y los respaldos.

## Qué hace falta decidir antes

1. Quién carga contenido y con qué frecuencia (¿una persona o varias
   organizaciones de la red?).
2. Si el contenido debe ser multilingüe desde el inicio (ES/EN).
3. Dónde vive el sitio en producción — el prototipo de referencia está en
   Firebase App Hosting, que corre Next pero no aloja el CMS.

Los tipos de `src/data/` sirven como borrador del esquema de contenidos para
cualquiera de las dos rutas: `Lab`, `Proyecto`, `Publicacion`, `Entrada`,
`Persona`, `Organizacion`, `Noticia` y `Centro`.
