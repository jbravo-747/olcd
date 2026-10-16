/**
 * Los cinco laboratorios (Contenidos de Diana B., octubre 2026). Viven en el
 * código; sus proyectos sí se editan en el CMS y se ligan por `slug`. La
 * descripción corta viene del encabezado de "Ejes de trabajo"; la
 * introducción, del documento de cada laboratorio.
 */

export type Lab = {
  slug: string;
  nombre: string;
  descripcion: string;
  introduccion: readonly string[];
};

export const labs = [
  {
    slug: "data-lab",
    nombre: "Data Lab",
    descripcion:
      "Una plataforma integral e interactiva que funcionará como centro neurálgico para recopilar, monitorear, analizar y visualizar información relacionada con los centros de datos en toda la región.",
    introduccion: [
      "El Data Lab brindará acceso continuo a diversos conjuntos de datos, resultados de investigaciones y herramientas de monitoreo, lo que permitirá a los responsables de la formulación de políticas, los investigadores, las organizaciones de la sociedad civil y las comunidades afectadas dar seguimiento a los impactos, comparar casos y responder a los acontecimientos que surjan.",
      "Los principales productos del Data Lab serán la Base de Datos Regional de Centros de Datos de acceso abierto, el Mapa de Centros de Datos y el Repositorio de Noticias.",
    ],
  },
  {
    slug: "citizen-science-lab",
    nombre: "Citizen Science Lab",
    descripcion:
      "Laboratorio participativo dedicado a la generación de evidencia empírica in situ mediante el diseño, la implementación y el uso de dispositivos de ciencia ciudadana de código abierto.",
    introduccion: [
      "El Laboratorio de Ciencia Ciudadana funcionará como un laboratorio participativo dedicado a la generación de evidencia empírica in situ mediante el diseño, la implementación y el uso de dispositivos de ciencia ciudadana de código abierto. Brindará capacitación a la comunidad en materia de monitoreo ambiental —incluidos indicadores relacionados con el aire, el agua, el ruido y la energía—, lo que permitirá a las poblaciones afectadas producir datos primarios que se incorporarán directamente a la Base de Datos del Centro de Datos y al Mapa del Centro de Datos.",
      "Además, el Laboratorio de Ciencia Ciudadana diseñará intervenciones que combinan arte y ciencia a partir de los datos recopilados. El Laboratorio de Ciencia Ciudadana contribuirá a la difusión creativa de los resultados al basar las narrativas y las comunicaciones en la evidencia generada por la comunidad y en la experiencia vivida, lo que fortalecerá la credibilidad y la accesibilidad de los hallazgos del proyecto.",
    ],
  },
  {
    slug: "methods-lab",
    nombre: "Methods Lab",
    descripcion:
      "Laboratorio que generará herramientas metodológicas estandarizadas y un conjunto armonizado de indicadores de impacto socioambiental y de derechos humanos para evaluar la infraestructura de los centros de datos.",
    introduccion: [
      "El Laboratorio de Métodos elaborará un conjunto de herramientas metodológicas estandarizadas pero adaptables, que incluirá directrices técnicas y un conjunto armonizado de indicadores de impacto socioambiental y de derechos humanos para evaluar la infraestructura de los centros de datos.",
      "Diseñados para su replicación a nivel regional, estos resultados dotarán a las organizaciones de la sociedad civil, a los investigadores y a los organismos reguladores de métodos sólidos y consistentes para evaluar los impactos, respaldar la toma de decisiones basada en evidencia y permitir la comparabilidad sistemática entre casos, sectores y países.",
    ],
  },
  {
    slug: "narratives-lab",
    nombre: "Narratives Lab",
    descripcion:
      "Espacio para el desarrollo de capacidades centrado en la comunidad y la transferencia creativa de conocimientos.",
    introduccion: [
      "El Laboratorio de Narrativas funcionará como un espacio para el desarrollo de capacidades centrado en la comunidad y la transferencia creativa de conocimientos. A través de talleres comunitarios y procesos de producción colaborativos, apoyará a las comunidades afectadas a transformar los hallazgos empíricos y las experiencias vividas en productos narrativos multimodales —como videos, podcasts, ensayos fotográficos, ilustraciones, fanzines, visualizaciones de datos y mapas— diseñados para comunicar los resultados en formatos accesibles y atractivos, amplificar las voces de la comunidad y ampliar la conciencia pública y política sobre los impactos de los centros de datos.",
    ],
  },
  {
    slug: "policy-lab",
    nombre: "Policy Lab",
    descripcion:
      "Laboratorio orientado a las políticas que sintetizará la evidencia generada en todos los componentes del proyecto para analizar sistemáticamente los marcos normativos existentes y emergentes que rigen el desarrollo de los centros de datos.",
    introduccion: [
      "El Laboratorio de Políticas funcionará como un laboratorio orientado a las políticas que sintetizará la evidencia generada en todos los componentes del proyecto para analizar sistemáticamente los marcos normativos existentes y emergentes que rigen el desarrollo de los centros de datos.",
      "Sus resultados incluirán resúmenes de políticas, modelos de gobernanza y recomendaciones prácticas y basadas en evidencia, destinadas a fortalecer la capacidad regulatoria y promover el desarrollo sostenible, transparente y respetuoso de los derechos de los centros de datos en toda América Latina. Entre los principales resultados del Laboratorio de Políticas se incluirán una base de datos de marcos normativos, una colección de estudios de caso y una serie de informes de políticas que ofrecerán marcos de gobernanza basados en evidencia y recomendaciones concretas de políticas.",
    ],
  },
] as const satisfies readonly Lab[];

export type SlugLab = (typeof labs)[number]["slug"];

/** Opciones del campo `lab` en las colecciones del CMS. */
export const opcionesLab = labs.map((l) => ({ label: l.nombre, value: l.slug }));

export function buscarLab(slug: string): Lab | undefined {
  return labs.find((l) => l.slug === slug);
}
