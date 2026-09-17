"use client";

import Link from "next/link";
import { useState } from "react";
import Marcador from "./Marcador";
import Paginacion from "./Paginacion";

export type FichaPersona = {
  slug: string;
  nombre: string;
  titulo: string;
  organizacion: string;
};

export default function GridPersonas({
  personas,
  porPagina = 12,
  etiquetaPaginacion = "Paginación de personas",
}: {
  personas: FichaPersona[];
  porPagina?: number;
  etiquetaPaginacion?: string;
}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(personas.length / porPagina);
  const visibles = personas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {visibles.map((persona) => (
          <li key={persona.slug} className="text-center">
            <Marcador etiqueta="[Foto]" className="mx-auto aspect-square w-full rounded-lg" />
            <h3 className="mt-4 text-base font-bold">{persona.nombre}</h3>
            <p className="text-[13px] text-ink/75">{persona.titulo}</p>
            <p className="text-[13px] text-ink/60">{persona.organizacion}</p>
            <Link href={`/quienes-somos/personas/${persona.slug}`} className="pill pill-dark mt-4">
              Leer más
              <span className="sr-only"> sobre {persona.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Paginacion pagina={pagina} total={totalPaginas} onCambio={setPagina} etiqueta={etiquetaPaginacion} />
    </div>
  );
}
