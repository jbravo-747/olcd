/**
 * Directorio real de organizaciones aliadas (Contenidos de Diana B., octubre
 * de 2026). Los logos están en src/seed/imagenes.
 */

export type Organizacion = {
  slug: string;
  nombre: string;
  region: string;
  web: string;
  correo: string;
  descripcion: string[];
  /** Nombre de archivo del logo dentro de src/seed/imagenes. */
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
