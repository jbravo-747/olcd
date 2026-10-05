/**
 * Estructura del menú y del pie. Las etiquetas viven en src/messages/*.json
 * bajo la clave "nav"; aquí sólo van las claves y los hrefs.
 *
 * Secciones ocultas temporalmente (se habilitarán después): llevan `oculto: true`.
 * Para reactivar una sección, basta quitar esa marca. Hoy sólo se muestran
 * "Mapa de centros de datos" y "Buscador de noticias".
 */

export type ItemNav = {
  clave: string;
  href: string;
  hijos?: ItemNav[];
  oculto?: boolean;
};

const todas: ItemNav[] = [
  {
    clave: "quienesSomos",
    href: "/quienes-somos",
    oculto: true,
    hijos: [
      { clave: "proposito", href: "/quienes-somos#proposito" },
      { clave: "equipo", href: "/quienes-somos#equipo" },
      { clave: "directorioOrganizaciones", href: "/quienes-somos#organizaciones" },
      { clave: "directorioPersonas", href: "/quienes-somos#personas" },
    ],
  },
  {
    clave: "ejesDeTrabajo",
    href: "/ejes-de-trabajo",
    oculto: true,
    hijos: [
      { clave: "dataLab", href: "/ejes-de-trabajo/data-lab" },
      { clave: "citizenScienceLab", href: "/ejes-de-trabajo/citizen-science-lab" },
      { clave: "methodsLab", href: "/ejes-de-trabajo/methods-lab" },
      { clave: "narrativesLab", href: "/ejes-de-trabajo/narratives-lab" },
      { clave: "policyLab", href: "/ejes-de-trabajo/policy-lab" },
    ],
  },
  { clave: "mapa", href: "/mapa-de-centros-de-datos" },
  { clave: "buscador", href: "/buscador-de-noticias" },
  {
    clave: "publicaciones",
    href: "/publicaciones",
    oculto: true,
    hijos: [
      { clave: "reportes", href: "/publicaciones#reportes" },
      { clave: "articulosLibros", href: "/publicaciones#articulos-y-libros" },
      { clave: "recursosEducativos", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    clave: "actualidad",
    href: "/actualidad",
    oculto: true,
    hijos: [
      { clave: "blog", href: "/actualidad#blog" },
      { clave: "comunicados", href: "/actualidad#comunicados" },
      { clave: "coberturaPrensa", href: "/actualidad#cobertura-de-prensa" },
      { clave: "noticiasObservatorio", href: "/actualidad#noticias-del-observatorio" },
    ],
  },
  { clave: "contacto", href: "/contacto", oculto: true },
];

/** Menú principal: sólo las secciones no ocultas. */
export const navegacion: ItemNav[] = todas.filter((item) => !item.oculto);

const hijosDe = (clave: string): ItemNav[] => todas.find((i) => i.clave === clave)?.hijos ?? [];

type ColumnaFooter = { titulo: ItemNav; enlaces: ItemNav[]; oculto?: boolean };

const columnas: ColumnaFooter[] = [
  {
    titulo: { clave: "quienesSomos", href: "/quienes-somos" },
    enlaces: hijosDe("quienesSomos"),
    oculto: true,
  },
  {
    titulo: { clave: "ejesDeTrabajo", href: "/ejes-de-trabajo" },
    enlaces: hijosDe("ejesDeTrabajo"),
    oculto: true,
  },
  {
    titulo: { clave: "mapa", href: "/mapa-de-centros-de-datos" },
    enlaces: [
      { clave: "buscador", href: "/buscador-de-noticias" },
      // Enlaces a Publicaciones ocultos junto con su sección:
      // { clave: "publicaciones", href: "/publicaciones" },
      // { clave: "reportes", href: "/publicaciones#reportes" },
      // { clave: "articulosLibros", href: "/publicaciones#articulos-y-libros" },
      // { clave: "recursosEducativos", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    titulo: { clave: "actualidad", href: "/actualidad" },
    oculto: true,
    enlaces: [
      { clave: "blog", href: "/actualidad#blog" },
      { clave: "comunicados", href: "/actualidad#comunicados" },
      { clave: "coberturaPrensa", href: "/actualidad#cobertura-de-prensa" },
      { clave: "noticiasObservatorio", href: "/actualidad#noticias-del-observatorio" },
      { clave: "contacto", href: "/contacto" },
    ],
  },
];

/** Columnas del pie: sólo las no ocultas. */
export const columnasFooter: { titulo: ItemNav; enlaces: ItemNav[] }[] = columnas
  .filter((c) => !c.oculto)
  .map(({ titulo, enlaces }) => ({ titulo, enlaces }));

export const enlacesLegales: ItemNav[] = [
  { clave: "accesibilidad", href: "/accesibilidad" },
  { clave: "privacidad", href: "/privacidad" },
  { clave: "terminosDeUso", href: "/terminos-de-uso" },
];
