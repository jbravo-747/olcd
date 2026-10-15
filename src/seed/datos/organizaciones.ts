/**
 * Directorio real de organizaciones aliadas (Contenidos de Diana B., octubre
 * de 2026). Los logos viven en la carpeta de contenidos (fuera de git) y el
 * seed los sube si la encuentra.
 */

export type Organizacion = {
  slug: string;
  nombre: string;
  region: string;
  web: string;
  correo: string;
  descripcion: string[];
  /** Nombre de archivo del logo dentro de la carpeta de contenidos. */
  logo?: string;
};

export const organizaciones: Organizacion[] = [
  {
    slug: "voceras-de-la-madre-tierra",
    nombre: "Vocer@s de la Madre Tierra",
    region: "México",
    web: "",
    correo: "",
    descripcion: [],
    logo: "logo-voceras.png",
  },
  {
    slug: "eheco",
    nombre: "Eheco",
    region: "México",
    web: "",
    correo: "",
    descripcion: [],
    logo: "logo-eheco.jpg",
  },
];
