/**
 * Estructura del menú y del pie. Las etiquetas viven en src/messages/*.json
 * bajo la clave "nav"; aquí sólo van las claves y los hrefs.
 */

export type ItemNav = {
  clave: string;
  href: string;
  hijos?: ItemNav[];
};

export const navegacion: ItemNav[] = [
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

export const columnasFooter: { titulo: ItemNav; enlaces: ItemNav[] }[] = [
  {
    titulo: { clave: "quienesSomos", href: "/quienes-somos" },
    enlaces: navegacion[0].hijos ?? [],
  },
  {
    titulo: { clave: "ejesDeTrabajo", href: "/ejes-de-trabajo" },
    enlaces: navegacion[1].hijos ?? [],
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

export const enlacesLegales: ItemNav[] = [
  { clave: "accesibilidad", href: "/accesibilidad" },
  { clave: "privacidad", href: "/privacidad" },
  { clave: "terminosDeUso", href: "/terminos-de-uso" },
];
