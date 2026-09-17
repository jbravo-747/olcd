"use client";

import Link from "next/link";
import { useState } from "react";
import Marcador from "./Marcador";
import Paginacion from "./Paginacion";

export type FichaOrganizacion = {
  slug: string;
  nombre: string;
};

export default function GridOrganizaciones({
  organizaciones,
  porPagina = 12,
}: {
  organizaciones: FichaOrganizacion[];
  porPagina?: number;
}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(organizaciones.length / porPagina);
  const visibles = organizaciones.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {visibles.map((org) => (
          <li key={org.slug} className="text-center">
            <Marcador etiqueta="[Logo]" className="mx-auto aspect-[16/10] w-full rounded-lg" />
            <h3 className="mt-4 text-base font-bold">{org.nombre}</h3>
            <Link href={`/quienes-somos/organizaciones/${org.slug}`} className="pill pill-dark mt-3">
              Leer más
              <span className="sr-only"> sobre {org.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Paginacion pagina={pagina} total={totalPaginas} onCambio={setPagina} etiqueta="Paginación de organizaciones" />
    </div>
  );
}
