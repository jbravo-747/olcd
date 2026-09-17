import type { Metadata } from "next";
import BuscadorNoticias from "@/components/BuscadorNoticias";
import { noticias } from "@/data/noticias";

export const metadata: Metadata = { title: "Buscador de noticias" };

/** N1 - Buscador de noticias (visualizador y buscador de notas). */
export default function PaginaBuscador() {
  return <BuscadorNoticias noticias={noticias} />;
}
