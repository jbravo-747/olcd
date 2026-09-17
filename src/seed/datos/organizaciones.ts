import { descripcionLarga } from "./lorem";

export type Organizacion = {
  slug: string;
  nombre: string;
  region: string;
  web: string;
  correo: string;
  descripcion: string[];
};

const regiones = ["México", "Brasil", "Chile", "Colombia", "Argentina", "Uruguay"];

export const organizaciones: Organizacion[] = Array.from({ length: 12 }, (_, i) => ({
  slug: `organizacion-${i + 1}`,
  nombre: `Nombre organización ${i + 1}`,
  region: regiones[i % regiones.length],
  web: "www.ejemplo.org",
  correo: "contacto@ejemplo.org",
  descripcion: descripcionLarga,
}));

export function buscarOrganizacion(slug: string) {
  return organizaciones.find((o) => o.slug === slug);
}
