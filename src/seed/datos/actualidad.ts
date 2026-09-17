import { descripcionCorta, descripcionLarga } from "./lorem";

export type TipoActualidad = "blog" | "comunicados" | "cobertura-de-prensa" | "noticias-del-observatorio";

export type Entrada = {
  slug: string;
  tipo: TipoActualidad;
  titulo: string;
  descripcion: string;
  contenido: string[];
  fecha: string;
  creditos: string;
  participantes: string;
  categorias: string[];
  fotos: number;
  /** Comunicados y cobertura de prensa se publican como PDF con etiquetas. */
  pdf?: string;
  fuente?: string;
};

export const tiposActualidad: { slug: TipoActualidad; nombre: string; descripcion: string }[] = [
  {
    slug: "blog",
    nombre: "Blog",
    descripcion:
      "[Descripción corta] Entradas del Observatorio con galería de imágenes, créditos y participantes.",
  },
  {
    slug: "comunicados",
    nombre: "Comunicados",
    descripcion: "[Descripción corta] Posicionamientos públicos del Observatorio en PDF descargable.",
  },
  {
    slug: "cobertura-de-prensa",
    nombre: "Cobertura de prensa",
    descripcion: "[Descripción corta] Menciones del Observatorio en medios de comunicación.",
  },
  {
    slug: "noticias-del-observatorio",
    nombre: "Noticias del Observatorio",
    descripcion: "[Descripción corta] Avisos, convocatorias y novedades de la red.",
  },
];

const fechas = [
  "Sábado, 03 Abril 2021",
  "Miércoles, 14 Febrero 2024",
  "Jueves, 25 Septiembre 2025",
  "Lunes, 09 Junio 2025",
  "Martes, 18 Marzo 2025",
  "Viernes, 22 Noviembre 2024",
];

function generar(tipo: TipoActualidad, cantidad: number): Entrada[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const entrada: Entrada = {
      slug: `${tipo}-${i + 1}`,
      tipo,
      titulo: `Título de la entrada ${i + 1}`,
      descripcion: descripcionCorta,
      contenido: descripcionLarga,
      fecha: fechas[i % fechas.length],
      creditos: "Créditos",
      participantes: "Participantes",
      categorias: ["Categoría 1", "Categoría 2"],
      fotos: 3,
    };
    if (tipo === "comunicados" || tipo === "cobertura-de-prensa") {
      entrada.pdf = "#";
    }
    if (tipo === "cobertura-de-prensa") {
      entrada.fuente = ["Milenio", "Data Center Dynamics", "EL PAÍS"][i % 3];
    }
    return entrada;
  });
}

export const entradas: Entrada[] = [
  ...generar("blog", 6),
  ...generar("comunicados", 6),
  ...generar("cobertura-de-prensa", 6),
  ...generar("noticias-del-observatorio", 6),
];

export function entradasPorTipo(tipo: TipoActualidad) {
  return entradas.filter((e) => e.tipo === tipo);
}

export function buscarEntrada(slug: string) {
  return entradas.find((e) => e.slug === slug);
}
