/**
 * Árbol de navegación del Observatorio.
 * Fuente: "Navegación Observatorio.pdf" (árbol de navegación corregido).
 * Este archivo es el único lugar donde se define el menú: el header y el
 * footer lo consumen, de modo que un CMS pueda reemplazarlo más adelante.
 */

export type ItemNav = {
  label: string;
  href: string;
  hijos?: ItemNav[];
};

export const navegacion: ItemNav[] = [
  {
    label: "Quiénes Somos",
    href: "/quienes-somos",
    hijos: [
      { label: "Propósito", href: "/quienes-somos#proposito" },
      { label: "Equipo", href: "/quienes-somos#equipo" },
      { label: "Directorio de organizaciones", href: "/quienes-somos#organizaciones" },
      { label: "Directorio de personas", href: "/quienes-somos#personas" },
    ],
  },
  {
    label: "Ejes de Trabajo",
    href: "/ejes-de-trabajo",
    hijos: [
      { label: "Data Lab", href: "/ejes-de-trabajo/data-lab" },
      { label: "Citizen Science Lab", href: "/ejes-de-trabajo/citizen-science-lab" },
      { label: "Methods Lab", href: "/ejes-de-trabajo/methods-lab" },
      { label: "Narratives Lab", href: "/ejes-de-trabajo/narratives-lab" },
      { label: "Policy Lab", href: "/ejes-de-trabajo/policy-lab" },
    ],
  },
  { label: "Mapa de Centros de Datos", href: "/mapa-de-centros-de-datos" },
  { label: "Buscador de Noticias", href: "/buscador-de-noticias" },
  {
    label: "Publicaciones",
    href: "/publicaciones",
    hijos: [
      { label: "Reportes", href: "/publicaciones#reportes" },
      { label: "Artículos y Libros", href: "/publicaciones#articulos-y-libros" },
      { label: "Recursos Educativos o Multimedia", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    label: "Actualidad",
    href: "/actualidad",
    hijos: [
      { label: "Blog", href: "/actualidad#blog" },
      { label: "Comunicados", href: "/actualidad#comunicados" },
      { label: "Cobertura de Prensa", href: "/actualidad#cobertura-de-prensa" },
      { label: "Noticias del Observatorio", href: "/actualidad#noticias-del-observatorio" },
    ],
  },
  { label: "Contacto", href: "/contacto" },
];

/** Columnas del pie de página, tal como aparecen en los wireframes. */
export const columnasFooter: { titulo: ItemNav; enlaces: ItemNav[] }[] = [
  {
    titulo: { label: "Quiénes Somos", href: "/quienes-somos" },
    enlaces: navegacion[0].hijos ?? [],
  },
  {
    titulo: { label: "Ejes de Trabajo", href: "/ejes-de-trabajo" },
    enlaces: navegacion[1].hijos ?? [],
  },
  {
    titulo: { label: "Mapa de Centros de Datos", href: "/mapa-de-centros-de-datos" },
    enlaces: [
      { label: "Buscador de Noticias", href: "/buscador-de-noticias" },
      { label: "Publicaciones", href: "/publicaciones" },
      { label: "Reportes", href: "/publicaciones#reportes" },
      { label: "Artículos y Libros", href: "/publicaciones#articulos-y-libros" },
      { label: "Recursos Educativos o Multimedia", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    titulo: { label: "Actualidad", href: "/actualidad" },
    enlaces: [
      { label: "Blog", href: "/actualidad#blog" },
      { label: "Comunicados", href: "/actualidad#comunicados" },
      { label: "Cobertura de Prensa", href: "/actualidad#cobertura-de-prensa" },
      { label: "Noticias del Observatorio", href: "/actualidad#noticias-del-observatorio" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

export const enlacesLegales: ItemNav[] = [
  { label: "Accesibilidad", href: "/accesibilidad" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Términos de uso", href: "/terminos-de-uso" },
];

export const redes = [
  { label: "Instagram", href: "https://instagram.com", icono: "instagram" as const },
  { label: "LinkedIn", href: "https://linkedin.com", icono: "linkedin" as const },
  { label: "Facebook", href: "https://facebook.com", icono: "facebook" as const },
];
