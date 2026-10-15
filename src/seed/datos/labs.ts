import { descripcionCorta, descripcionLarga, parrafosSeccion } from "./lorem";

export type SeccionProyecto = {
  titulo: string;
  parrafos: string[];
  subsecciones: { titulo: string; parrafos: string[] }[];
};

export type Proyecto = {
  slug: string;
  lab: string;
  titulo: string;
  descripcion: string;
  autores: string;
  anio: string;
  lugar: string;
  participantes: string;
  categorias: string[];
  /** Número de fotos del carrusel (marcadores de posición en la maqueta). */
  fotos: number;
  secciones: SeccionProyecto[];
  /** Sólo en Policy Lab: iniciativa de ley descargable. */
  descargable?: { etiqueta: string; archivo: string };
};

export type Lab = {
  slug: string;
  nombre: string;
  descripcion: string;
  introduccion: string[];
  proyectos: Proyecto[];
};

const nombresLabs: [string, string][] = [
  ["data-lab", "Data Lab"],
  ["citizen-science-lab", "Citizen Science Lab"],
  ["methods-lab", "Methods Lab"],
  ["narratives-lab", "Narratives Lab"],
  ["policy-lab", "Policy Lab"],
];

function secciones(): SeccionProyecto[] {
  return [1, 2, 3].map((n) => ({
    titulo: `Título sección ${n}`,
    parrafos: [descripcionLarga[0], parrafosSeccion[0]],
    subsecciones: [1, 2, 3].map((m) => ({
      titulo: `Subtítulo de sección ${n}.${m}`,
      parrafos: [parrafosSeccion[1], parrafosSeccion[2]],
    })),
  }));
}

function proyectos(labSlug: string, labNombre: string): Proyecto[] {
  return Array.from({ length: 9 }, (_, i) => {
    const n = i + 1;
    const proyecto: Proyecto = {
      slug: `proyecto-${n}`,
      lab: labSlug,
      titulo: `Título del proyecto ${n}`,
      descripcion: descripcionCorta,
      autores: "Autores",
      anio: `${2021 + (n % 5)}`,
      lugar: "Lugar",
      participantes: "Participantes",
      categorias: ["Categoría 1", "Categoría 2", "Categoría 3"],
      fotos: 4,
      secciones: secciones(),
    };
    if (labSlug === "policy-lab") {
      proyecto.descargable = {
        etiqueta: "Iniciativa de ley (PDF descargable)",
        archivo: "#",
      };
      proyecto.secciones = [
        {
          titulo: "Explicación de la metodología",
          parrafos: [descripcionLarga[0], parrafosSeccion[0]],
          subsecciones: [
            { titulo: "Fuentes y criterios", parrafos: [parrafosSeccion[1]] },
            { titulo: "Alcances y límites", parrafos: [parrafosSeccion[2]] },
          ],
        },
        ...secciones().slice(0, 2),
      ];
    }
    void labNombre;
    return proyecto;
  });
}

/**
 * Contenido real por lab (Contenidos de Diana B., octubre 2026). La
 * descripción corta viene del encabezado de "Ejes de trabajo"; la
 * introducción, del documento de cada laboratorio. Los proyectos siguen
 * siendo de maqueta: el contenido oficial los marca "[En construcción]".
 */
const contenidoLabs: Record<string, { descripcion: string; introduccion: string[] }> = {
  "data-lab": {
    descripcion:
      "Una plataforma integral e interactiva que funcionará como centro neurálgico para recopilar, monitorear, analizar y visualizar información relacionada con los centros de datos en toda la región.",
    introduccion: [
      "El Data Lab brindará acceso continuo a diversos conjuntos de datos, resultados de investigaciones y herramientas de monitoreo, lo que permitirá a los responsables de la formulación de políticas, los investigadores, las organizaciones de la sociedad civil y las comunidades afectadas dar seguimiento a los impactos, comparar casos y responder a los acontecimientos que surjan.",
      "Los principales productos del Data Lab serán la Base de Datos Regional de Centros de Datos de acceso abierto, el Mapa de Centros de Datos y el Repositorio de Noticias.",
    ],
  },
  "citizen-science-lab": {
    descripcion:
      "Laboratorio participativo dedicado a la generación de evidencia empírica in situ mediante el diseño, la implementación y el uso de dispositivos de ciencia ciudadana de código abierto.",
    introduccion: [
      "El Laboratorio de Ciencia Ciudadana funcionará como un laboratorio participativo dedicado a la generación de evidencia empírica in situ mediante el diseño, la implementación y el uso de dispositivos de ciencia ciudadana de código abierto. Brindará capacitación a la comunidad en materia de monitoreo ambiental —incluidos indicadores relacionados con el aire, el agua, el ruido y la energía—, lo que permitirá a las poblaciones afectadas producir datos primarios que se incorporarán directamente a la Base de Datos del Centro de Datos y al Mapa del Centro de Datos.",
      "Además, el Laboratorio de Ciencia Ciudadana diseñará intervenciones que combinan arte y ciencia a partir de los datos recopilados. El Laboratorio de Ciencia Ciudadana contribuirá a la difusión creativa de los resultados al basar las narrativas y las comunicaciones en la evidencia generada por la comunidad y en la experiencia vivida, lo que fortalecerá la credibilidad y la accesibilidad de los hallazgos del proyecto.",
    ],
  },
  "methods-lab": {
    descripcion:
      "Laboratorio que generará herramientas metodológicas estandarizadas y un conjunto armonizado de indicadores de impacto socioambiental y de derechos humanos para evaluar la infraestructura de los centros de datos.",
    introduccion: [
      "El Laboratorio de Métodos elaborará un conjunto de herramientas metodológicas estandarizadas pero adaptables, que incluirá directrices técnicas y un conjunto armonizado de indicadores de impacto socioambiental y de derechos humanos para evaluar la infraestructura de los centros de datos.",
      "Diseñados para su replicación a nivel regional, estos resultados dotarán a las organizaciones de la sociedad civil, a los investigadores y a los organismos reguladores de métodos sólidos y consistentes para evaluar los impactos, respaldar la toma de decisiones basada en evidencia y permitir la comparabilidad sistemática entre casos, sectores y países.",
    ],
  },
  "narratives-lab": {
    descripcion:
      "Espacio para el desarrollo de capacidades centrado en la comunidad y la transferencia creativa de conocimientos.",
    introduccion: [
      "El Laboratorio de Narrativas funcionará como un espacio para el desarrollo de capacidades centrado en la comunidad y la transferencia creativa de conocimientos. A través de talleres comunitarios y procesos de producción colaborativos, apoyará a las comunidades afectadas a transformar los hallazgos empíricos y las experiencias vividas en productos narrativos multimodales —como videos, podcasts, ensayos fotográficos, ilustraciones, fanzines, visualizaciones de datos y mapas— diseñados para comunicar los resultados en formatos accesibles y atractivos, amplificar las voces de la comunidad y ampliar la conciencia pública y política sobre los impactos de los centros de datos.",
    ],
  },
  "policy-lab": {
    descripcion:
      "Laboratorio orientado a las políticas que sintetizará la evidencia generada en todos los componentes del proyecto para analizar sistemáticamente los marcos normativos existentes y emergentes que rigen el desarrollo de los centros de datos.",
    introduccion: [
      "El Laboratorio de Políticas funcionará como un laboratorio orientado a las políticas que sintetizará la evidencia generada en todos los componentes del proyecto para analizar sistemáticamente los marcos normativos existentes y emergentes que rigen el desarrollo de los centros de datos.",
      "Sus resultados incluirán resúmenes de políticas, modelos de gobernanza y recomendaciones prácticas y basadas en evidencia, destinadas a fortalecer la capacidad regulatoria y promover el desarrollo sostenible, transparente y respetuoso de los derechos de los centros de datos en toda América Latina. Entre los principales resultados del Laboratorio de Políticas se incluirán una base de datos de marcos normativos, una colección de estudios de caso y una serie de informes de políticas que ofrecerán marcos de gobernanza basados en evidencia y recomendaciones concretas de políticas.",
    ],
  },
};

export const labs: Lab[] = nombresLabs.map(([slug, nombre]) => ({
  slug,
  nombre,
  ...contenidoLabs[slug],
  proyectos: proyectos(slug, nombre),
}));

export function buscarLab(slug: string) {
  return labs.find((l) => l.slug === slug);
}

export function buscarProyecto(labSlug: string, proyectoSlug: string) {
  const lab = buscarLab(labSlug);
  if (!lab) return undefined;
  const proyecto = lab.proyectos.find((p) => p.slug === proyectoSlug);
  return proyecto ? { lab, proyecto } : undefined;
}
