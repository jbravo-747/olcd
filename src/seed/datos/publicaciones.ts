import { descripcionCorta, descripcionLarga } from "./lorem";

export type TipoPublicacion = "reportes" | "articulos-y-libros" | "recursos-educativos";

export type Publicacion = {
  slug: string;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  contenido: string[];
  lab: string;
  autores: string;
  anio: string;
  paginas: string;
  categorias: string[];
  pdf: string;
};

export const tiposPublicacion: { slug: TipoPublicacion; nombre: string; descripcion: string }[] = [
  {
    slug: "reportes",
    nombre: "Reportes",
    descripcion:
      "[Descripción corta] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus. Donec tellus orci, eleifend eu posuere in, aliquam vel erat. Suspendisse condimentum mauris tincidunt leo eleifend porta rhoncus sed risus.",
  },
  {
    slug: "articulos-y-libros",
    nombre: "Artículos y libros",
    descripcion:
      "[Descripción corta] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus. Donec tellus orci, eleifend eu posuere in, aliquam vel erat. Suspendisse condimentum mauris tincidunt leo eleifend porta rhoncus sed risus.",
  },
  {
    slug: "recursos-educativos",
    nombre: "Recursos educativos o multimedia",
    descripcion:
      "[Descripción corta] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus. Donec tellus orci, eleifend eu posuere in, aliquam vel erat. Suspendisse condimentum mauris tincidunt leo eleifend porta rhoncus sed risus.",
  },
];

const labs = ["Data Lab", "Citizen Science Lab", "Methods Lab", "Narratives Lab", "Policy Lab"];

function generar(tipo: TipoPublicacion, cantidad: number): Publicacion[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    slug: `${tipo}-${i + 1}`,
    tipo,
    titulo: `Título del recurso ${i + 1}`,
    descripcion: descripcionCorta,
    contenido: descripcionLarga,
    lab: labs[i % labs.length],
    autores: "Autores",
    anio: `${2020 + (i % 6)}`,
    paginas: `${20 + i * 4}`,
    categorias: ["Categoría 1", "Categoría 2", "Categoría 3"],
    pdf: "#",
  }));
}

export const publicaciones: Publicacion[] = [
  ...generar("reportes", 9),
  ...generar("articulos-y-libros", 9),
  ...generar("recursos-educativos", 9),
];

export function publicacionesPorTipo(tipo: TipoPublicacion) {
  return publicaciones.filter((p) => p.tipo === tipo);
}

export function buscarPublicacion(slug: string) {
  return publicaciones.find((p) => p.slug === slug);
}
