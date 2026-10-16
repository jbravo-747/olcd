import type { Locale } from "@/i18n/routing";

/**
 * Textos institucionales del sitio (Contenidos de Diana B., octubre 2026).
 * Viven en el código, no en el CMS: cambian poco y así cada despliegue los
 * publica sin tocar la base. Lo que el equipo alimenta seguido (publicaciones,
 * actualidad, noticias, proyectos) sí se edita en /admin.
 *
 * Las secciones sin contenido real quedan vacías y el sitio las muestra "en
 * construcción". El inglés cae al español hasta que se traduzca.
 */

const EN_CONSTRUCCION = ["En construcción."];

const es = {
  inicio: {
    texto:
      "El Observatorio Latinoamericano de Centros de Datos es la primera iniciativa regional dedicada a investigar, documentar y monitorear los impactos multidimensionales de los centros de datos sobre los derechos humanos en América Latina.",
  },
  quienesSomos: {
    titulo:
      "La primera iniciativa regional dedicada a investigar, documentar y monitorear los impactos de los centros de datos sobre los derechos humanos en América Latina.",
    proposito: [
      "El Observatorio Latinoamericano de Centros de Datos es la primera iniciativa regional dedicada a investigar, documentar y monitorear los impactos multidimensionales de los centros de datos sobre los derechos humanos en América Latina. A medida que la región se convierte en un lugar cada vez más estratégico para el despliegue de la infraestructura digital global, la expansión de los centros de datos está ejerciendo nuevas presiones sobre el agua, la energía y el territorio, con escasa transparencia, consulta pública o rendición de cuentas. Los impactos de estas infraestructuras recaen de manera desproporcionada sobre comunidades que ya enfrentan vulnerabilidad ambiental y política.",
      "Desde una perspectiva de justicia global, y a través de metodologías participativas, el Observatorio trabaja con comunidades afectadas, organizaciones de la sociedad civil, periodistas, personas de la academia, personas defensoras de derechos humanos, personas abogadas y artistas para generar evidencia rigurosa sobre estos impactos.",
    ],
    equipoTexto:
      "El equipo del Observatorio Latinoamericano de Centros de Datos (OLCD) está conformado por personas de la academia, artistas, personas investigadoras, periodistas y activistas comprometidas con investigar el impacto de la infraestructura digital en Latinoamérica desde una perspectiva interseccional y de derechos humanos.",
    organizacionesTexto:
      "Colaboramos con grupos de defensa ambiental y de derechos humanos que investigan el impacto socioambiental de los centros de datos en territorio. En conjunto, desarrollamos estrategias de defensa legal, divulgación e incidencia.",
    personasTexto:
      "Colaboramos con individuos que impulsan la investigación y documentación de los impactos multidimensionales de la infraestructura digital en Latinoamérica. Desde sus áreas de especialización, estas personas contribuyen a un debate informado y a la divulgación del tema.",
  },
  paginas: {
    ejesDeTrabajo:
      "El Observatorio Latinoamericano de Centros de Datos (OLCD) busca convertirse en un centro de conocimiento y una red regional que investigue, documente y monitoree los impactos en los derechos humanos de la industria de los centros de datos en toda la región. Para alcanzar este objetivo, el OLCD generará resultados de gran impacto en cinco laboratorios que, en conjunto, permitirán la recopilación de datos, el análisis, la participación de la comunidad, la generación de conocimiento y el impacto en las políticas.",
    mapa: "Registro colaborativo de los centros de datos anunciados, en construcción y en operación en América Latina.",
    mapaResumen:
      "Registro colaborativo de la infraestructura anunciada, en construcción y en operación en América Latina.",
    contacto:
      "Para ponerse en contacto con el Observatorio Latinoamericano de Centros de Datos, favor de rellenar el formulario y alguna persona del equipo responderá a la brevedad. Para medios de comunicación interesados en entrevistas, escribir al correo datacenters@riseup.net.",
  },
  publicaciones: {
    reportes: "",
    articulosLibros: "",
    recursosEducativos: "",
  },
  actualidad: {
    blog: "Entradas del Observatorio con galería de imágenes, créditos y participantes.",
    comunicados: "Posicionamientos públicos del Observatorio en PDF descargable.",
    coberturaPrensa: "Menciones del Observatorio en medios de comunicación.",
    noticiasObservatorio: "Avisos, convocatorias y novedades de la red.",
  },
  legales: {
    accesibilidad: EN_CONSTRUCCION,
    privacidad: EN_CONSTRUCCION,
    terminos: EN_CONSTRUCCION,
  },
};

export type TextosSitio = typeof es;

/** Traducciones por sección; lo que falte se muestra en español. */
const en: Partial<TextosSitio> = {};

export function textosDelSitio(locale: Locale): TextosSitio {
  return locale === "en" ? { ...es, ...en } : es;
}

export const redes = {
  correoContacto: "datacenters@riseup.net",
  enlaces: [
    { red: "instagram", url: "https://instagram.com" },
    { red: "linkedin", url: "https://linkedin.com" },
    { red: "facebook", url: "https://facebook.com" },
  ] as const,
};
