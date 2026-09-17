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

export const labs: Lab[] = nombresLabs.map(([slug, nombre]) => ({
  slug,
  nombre,
  descripcion: descripcionCorta,
  introduccion: descripcionLarga,
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
