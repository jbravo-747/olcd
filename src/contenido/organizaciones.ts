import type { FuenteImagen } from "@/components/Imagen";

/**
 * Organizaciones aliadas (Contenidos de Diana B., octubre 2026). Viven en el
 * código; los logos están en public/imagenes/organizaciones.
 */

export type OrganizacionAliada = {
  slug: string;
  nombre: string;
  region?: string;
  web?: string;
  correo?: string;
  descripcion: string[];
  logo?: FuenteImagen;
};

export const organizaciones: OrganizacionAliada[] = [
  {
    slug: "voceras-de-la-madre-tierra",
    nombre: "Vocer@s de la Madre Tierra",
    region: "México",
    descripcion: [],
    logo: {
      url: "/imagenes/organizaciones/logo-voceras.png",
      alt: "Logo de Vocer@s de la Madre Tierra",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "eheco",
    nombre: "Eheco",
    region: "México",
    descripcion: [],
    logo: { url: "/imagenes/organizaciones/logo-eheco.jpg", alt: "Logo de Eheco", width: 1200, height: 495 },
  },
];

export function buscarOrganizacion(slug: string) {
  return organizaciones.find((o) => o.slug === slug);
}
