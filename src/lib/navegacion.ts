/**
 * Estructura del menú y del pie. Las etiquetas viven en src/messages/*.json
 * bajo la clave "nav"; aquí sólo van las claves y los hrefs.
 *
 * Para ocultar temporalmente una sección (menú y pie), márcala con
 * `oculto: true`; para reactivarla, quita la marca.
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
    hijos: [
      { clave: "reportes", href: "/publicaciones#reportes" },
      { clave: "articulosLibros", href: "/publicaciones#articulos-y-libros" },
      { clave: "recursosEducativos", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    clave: "actualidad",
    href: "/actualidad",
    hijos: [
      { clave: "blog", href: "/actualidad#blog" },
      { clave: "comunicados", href: "/actualidad#comunicados" },
      { clave: "coberturaPrensa", href: "/actualidad#cobertura-de-prensa" },
      { clave: "noticiasObservatorio", href: "/actualidad#noticias-del-observatorio" },
    ],
  },
  { clave: "contacto", href: "/contacto" },
];

/** Menú principal: sólo las secciones no ocultas. */
export const navegacion: ItemNav[] = todas.filter((item) => !item.oculto);

const hijosDe = (clave: string): ItemNav[] => todas.find((i) => i.clave === clave)?.hijos ?? [];

type ColumnaFooter = { titulo: ItemNav; enlaces: ItemNav[]; oculto?: boolean };

const columnas: ColumnaFooter[] = [
  {
    titulo: { clave: "quienesSomos", href: "/quienes-somos" },
    enlaces: hijosDe("quienesSomos"),
  },
  {
    titulo: { clave: "ejesDeTrabajo", href: "/ejes-de-trabajo" },
    enlaces: hijosDe("ejesDeTrabajo"),
  },
  {
    titulo: { clave: "mapa", href: "/mapa-de-centros-de-datos" },
    enlaces: [
      { clave: "buscador", href: "/buscador-de-noticias" },
      { clave: "publicaciones", href: "/publicaciones" },
      { clave: "reportes", href: "/publicaciones#reportes" },
      { clave: "articulosLibros", href: "/publicaciones#articulos-y-libros" },
      { clave: "recursosEducativos", href: "/publicaciones#recursos-educativos" },
    ],
  },
  {
    titulo: { clave: "actualidad", href: "/actualidad" },
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
