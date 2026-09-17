import type { Metadata } from "next";
import ExploradorPublicaciones from "@/components/ExploradorPublicaciones";
import { entradas, tiposActualidad } from "@/data/actualidad";

export const metadata: Metadata = { title: "Actualidad" };

/** N1 - Actualidad (Blog · Comunicados · Cobertura de prensa · Noticias) */
export default function PaginaActualidad() {
  const items = entradas.map((e) => ({
    slug: e.slug,
    tipo: e.tipo,
    titulo: e.titulo,
    descripcion: e.descripcion,
    etiqueta: tiposActualidad.find((t) => t.slug === e.tipo)?.nombre,
    href: `/actualidad/${e.slug}`,
  }));

  return (
    <ExploradorPublicaciones
      titulo="Actualidad"
      etiquetaTipo="Sección"
      categorias={tiposActualidad}
      items={items}
    />
  );
}
