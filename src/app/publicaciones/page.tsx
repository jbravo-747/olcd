import type { Metadata } from "next";
import ExploradorPublicaciones from "@/components/ExploradorPublicaciones";
import { publicaciones, tiposPublicacion } from "@/data/publicaciones";

export const metadata: Metadata = { title: "Publicaciones" };

/** N1 - Publicaciones */
export default function PaginaPublicaciones() {
  const items = publicaciones.map((p) => ({
    slug: p.slug,
    tipo: p.tipo,
    titulo: p.titulo,
    descripcion: p.descripcion,
    etiqueta: tiposPublicacion.find((t) => t.slug === p.tipo)?.nombre,
    href: `/publicaciones/${p.slug}`,
  }));

  return (
    <ExploradorPublicaciones
      titulo="Publicaciones"
      etiquetaTipo="Tipo"
      categorias={tiposPublicacion}
      items={items}
    />
  );
}
