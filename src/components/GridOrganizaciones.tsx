"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Media } from "@/payload-types";
import { Link } from "@/i18n/navigation";
import Imagen from "./Imagen";
import Paginacion from "./Paginacion";

export type FichaOrganizacion = {
  slug: string;
  nombre: string;
  logo?: Media | null;
};

export default function GridOrganizaciones({
  organizaciones,
  porPagina = 12,
}: {
  organizaciones: FichaOrganizacion[];
  porPagina?: number;
}) {
  const t = useTranslations("comun");
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(organizaciones.length / porPagina);
  const visibles = organizaciones.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {visibles.map((org) => (
          <li key={org.slug} className="text-center">
            <Imagen
              media={org.logo}
              etiqueta="[Logo]"
              className="mx-auto aspect-[16/10] w-full rounded-lg"
              sizes="(min-width: 1024px) 280px, 50vw"
            />
            <h3 className="mt-4 text-base font-bold">{org.nombre}</h3>
            <Link href={`/quienes-somos/organizaciones/${org.slug}`} className="pill pill-dark mt-3">
              {t("leerMas")}
              <span className="sr-only"> {t("sobre", { titulo: org.nombre })}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Paginacion pagina={pagina} total={totalPaginas} onCambio={setPagina} etiqueta={t("paginacion")} />
    </div>
  );
}
