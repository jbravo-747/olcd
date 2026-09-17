/**
 * Fuente del buscador de noticias (N1 - Buscador de noticias).
 * Los títulos y medios provienen de los ejemplos del wireframe.
 */

export type Noticia = {
  id: string;
  titulo: string;
  medio: string;
  fecha: string;
  hora: string;
  categorias: string[];
  url: string;
};

export const categoriasNoticias = [
  "Único centro de datos",
  "Narrativas o discursos oficiales",
  "Empleo",
  "Monto de inversión",
  "Agua y energía",
  "Regulación",
];

const base: Omit<Noticia, "id">[] = [
  {
    titulo: "Querétaro, el paraíso de los centros de datos",
    medio: "Milenio",
    fecha: "Sábado, 03 Abril 2021",
    hora: "07:00 GMT",
    categorias: ["Único centro de datos", "Narrativas o discursos oficiales", "Empleo", "Monto de inversión"],
    url: "#",
  },
  {
    titulo: "ODATA amplía su presencia en México con la construcción de dos nuevos campus de Data Center",
    medio: "Data Center Dynamics",
    fecha: "Miércoles, 14 Febrero 2024",
    hora: "08:00 GMT",
    categorias: ["Único centro de datos", "Narrativas o discursos oficiales"],
    url: "#",
  },
  {
    titulo: "CloudHQ invierte 4.800 millones de dólares en un centro de datos en Querétaro",
    medio: "EL PAÍS",
    fecha: "Jueves, 25 Septiembre 2025",
    hora: "07:00 GMT",
    categorias: ["Único centro de datos", "Monto de inversión"],
    url: "#",
  },
  {
    titulo: "Comunidades de Santiago cuestionan el consumo de agua de un nuevo centro de datos",
    medio: "La Tercera",
    fecha: "Lunes, 09 Junio 2025",
    hora: "10:30 GMT",
    categorias: ["Agua y energía", "Narrativas o discursos oficiales"],
    url: "#",
  },
  {
    titulo: "São Paulo discute incentivos fiscales para atraer infraestructura de nube",
    medio: "Folha de S.Paulo",
    fecha: "Martes, 18 Marzo 2025",
    hora: "12:00 GMT",
    categorias: ["Regulación", "Monto de inversión"],
    url: "#",
  },
  {
    titulo: "El empleo prometido por los data centers: qué dicen las cifras",
    medio: "Chequeado",
    fecha: "Viernes, 22 Noviembre 2024",
    hora: "09:15 GMT",
    categorias: ["Empleo", "Narrativas o discursos oficiales"],
    url: "#",
  },
];

/** 27 registros para poder mostrar la paginación de la maqueta. */
export const noticias: Noticia[] = Array.from({ length: 27 }, (_, i) => ({
  ...base[i % base.length],
  id: `noticia-${i + 1}`,
}));
