"use client";

import Link from "next/link";
import { useState } from "react";
import Marcador from "./Marcador";
import Paginacion from "./Paginacion";

export type Recurso = {
  slug: string;
  titulo: string;
  descripcion: string;
  etiqueta?: string;
  href: string;
};

/**
 * Rejilla de tarjetas con paginación (patrón repetido en Inicio, Ejes de
 * trabajo, Publicaciones y Actualidad).
 */
export default function GridRecursos({
  recursos,
  porPagina = 9,
  tema = "claro",
  etiquetaPaginacion = "Paginación de recursos",
}: {
  recursos: Recurso[];
  porPagina?: number;
  tema?: "claro" | "oscuro";
  etiquetaPaginacion?: string;
}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(recursos.length / porPagina);
  const visibles = recursos.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((recurso) => (
          <li key={recurso.slug} className="flex">
            <article className="flex w-full flex-col overflow-hidden rounded-xl bg-cream shadow-sm transition-transform hover:-translate-y-1">
              <div className="relative">
                <Marcador className="aspect-[4/3] w-full" />
                {recurso.etiqueta && (
                  <span className="tag absolute right-3 top-3">{recurso.etiqueta}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="t-card-title font-bold">{recurso.titulo}</h3>
                <p className="t-card-desc mt-2 flex-1 text-ink/75">{recurso.descripcion}</p>
                <div className="mt-5">
                  <Link href={recurso.href} className="pill pill-dark">
                    Leer más
                    <span className="sr-only"> sobre {recurso.titulo}</span>
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className={tema === "oscuro" ? "text-cream" : ""}>
        <Paginacion pagina={pagina} total={totalPaginas} onCambio={setPagina} etiqueta={etiquetaPaginacion} />
      </div>
    </div>
  );
}
